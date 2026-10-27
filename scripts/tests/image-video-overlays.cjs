const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const hooks = new Map();
const sandbox = {exports:{}, React:{Fragment:'fragment',createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity).filter(Boolean)})},require(name){
    if(name==='@wordpress/i18n') return {__:text=>text};
    if(name==='@wordpress/hooks')return {addFilter:(hook,id,fn)=>hooks.set(hook,fn)};
    return new Proxy({}, {get:(_,key)=>key});
}};
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/imageHoverActionPremiumControls.js','utf8'),{babelrc:false,configFile:false,plugins:['@babel/plugin-transform-modules-commonjs','@babel/plugin-transform-react-jsx']}).code,sandbox);
sandbox.exports.registerImageHoverActionPremiumControls({hookPrefix:'image',namespace:'image'});
const find=(node,label)=>node?.props?.label===label?node:node?.children?.map(child=>find(child,label)).find(Boolean);
for(const style of ['blur-overlay','fade-overlay','gradient-bottom','chip','chip-gradient','color-overlay','gradient-overlay']){
    for(const inherited of [false,true]){
        let update;
        const tree=hooks.get('image.onHoverTitleToggle')(null,{attributes:{onHoverStyle:style,showTitleOnHover:true,...(!inherited?{imageClickAction:'video_lightbox'}:{})},context:inherited?{'folioBlocks/imageClickAction':'video_lightbox'}:{},setAttributes:value=>update=value});
        const content=find(tree,'Overlay Content');
        assert(content,style);
        const option=content.props.options.find(option=>option.value==='video_play');
        assert(option && option.label==='Show Video Play Button',style);
        content.props.onChange('video_play');
        assert(update.overlayContent==='video_play' && update.showTitleOnHover && update.onHoverTitle,style);
    }
}
const tree=hooks.get('image.onHoverTitleToggle')(null,{attributes:{imageClickAction:'lightbox',onHoverStyle:'blur-overlay',showTitleOnHover:true},setAttributes:()=>{}});
assert(!find(tree,'Overlay Content').props.options.some(option=>option.value==='video_play'));
console.log('Passed: video play overlay option and selection for every overlay style, standalone/inherited video action, and exclusion for image lightboxes.');
