const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const hooks = new Map();
const stub = name => name;
const exportsObject = {};
const sandbox = { exports: exportsObject, React: { createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(Boolean) }), Fragment: 'fragment' }, require(name) {
    if(name === '@wordpress/i18n') return { __: value => value };
    if(name === '@wordpress/hooks') return { addFilter: (hook, namespace, fn) => hooks.set(hook, fn) };
    if(name === './urlValidation') return { isValidHttpUrl: value => /^https?:\/\//.test(value) };
    return new Proxy({}, { get: (_, key) => stub(key) });
} };
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/videoLightboxControls.js','utf8'), {babelrc:false,configFile:false,plugins:['@babel/plugin-transform-modules-commonjs','@babel/plugin-transform-react-jsx']}).code, sandbox);
for(const key of ['image','carousel','filmstrip','grid','justified','modular','masonry']) {
    const metadata = JSON.parse(fs.readFileSync(`src/${key === 'image' ? 'image-block' : key + '-gallery-block'}/block.json`,'utf8'));
    assert(metadata.attributes.imageClickAction.enum.includes('video_lightbox'));
    assert(metadata.attributes.overlayContent.enum.includes('video_play'));
    if(key === 'image') assert.equal(metadata.attributes.videoLightboxUrl.type, 'string');
    const hookPrefix = key;
    exportsObject.registerVideoLightboxControls({hookPrefix, namespace:key, LightboxControl:'lightbox',includeSource:key==='image',showCounterControl:key!=='image'});
    const options = hooks.get(`${key}.imageClickActionOptions`)([]);
    assert.equal(options[0].label, 'Play Video in Lightbox');
    const ordered = hooks.get(`${key}.imageClickActionOptions`)([{value:'none'}, {value:'download'}, {value:'woocommerce'}]);
    assert.deepEqual(Array.from(ordered, option => option.value), ['none', 'download', 'video_lightbox', 'woocommerce']);
    let writes;
    const render = target => hooks.get(`${key}.imageClickActionNotice`)(null, {attributes:{imageClickAction:'video_lightbox',imageClickTarget:target},setAttributes:value => writes=value});
    for(const target of ['icon','thumbnail']) {
        const tree = render(target);
        const controls = tree.children.filter(c => c.type==='SelectControl');
        assert.equal(controls[0].props.label,'Link Target');
        assert.equal(controls[0].props.options[0].label,'Icon');
        assert.equal(controls.length,target==='icon'?2:1);
        if(target==='icon') assert.deepEqual(Array.from(controls[1].props.options,o=>o.value),['hover','always']);
        const lightbox = tree.children.find(c=>c.type==='lightbox');
        assert(lightbox && lightbox.props.showZoomControl===false && lightbox.props.showCounterControl===(key!=='image'));
        controls[0].props.onChange('thumbnail'); assert.equal(writes.imageClickTarget,'thumbnail');
    }
    assert.equal(hooks.get(`${key}.imageClickActionNotice`)('existing',{attributes:{imageClickAction:'download'}}),'existing');
}
console.log('Passed: video click actions and metadata for Image and six galleries, Icon/Thumbnail controls, display choices, lightbox controls without zoom.');
// The media frame stays mounted outside the popover when switching from the toolbar.
{
    let selected;
    const events = [];
    const toolbar = exportsObject.VideoLightboxToolbar({attributes:{},setAttributes:value => selected=value});
    const upload = toolbar.children[0];
    assert.equal(upload.type,'MediaUpload');
    const dropdown = upload.props.render({open:() => events.push('media opened')});
    const popover = dropdown.props.renderContent({onClose:() => events.push('popover closed')});
    const source = popover.children[0];
    source.props.openMedia();
    assert.deepEqual(events,['media opened','popover closed']);
    upload.props.onSelect({url:'https://example.com/video.mp4'});
    assert.equal(selected.videoLightboxUrl,'https://example.com/video.mp4');
}
console.log('Passed: toolbar closes its popover on media launch and retains the media selection callback.');
