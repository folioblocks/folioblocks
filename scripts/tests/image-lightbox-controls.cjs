const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const source = fs.readFileSync('src/image-block/premium.js', 'utf8');
const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
let component;
traverse(ast, { VariableDeclarator(path) {
    if (path.node.id.name === 'LinkTargetControls') component = source.slice(path.parent.start, path.parent.end);
} });
assert(component, 'Missing LinkTargetControls');
const createElement = (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(Boolean) });
const sandbox = {
    React: { createElement, Fragment: 'fragment' },
    __: text => text,
    SelectControl: 'select', ToggleControl: 'toggle', LightboxContentControl: 'lightbox',
};
vm.runInNewContext(babel.transformSync(`${component}\nthis.render = LinkTargetControls;`, {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-react-jsx'],
}).code, sandbox);
const find = (node, type) => node?.type === type ? node : node?.children?.map(child => find(child, type)).find(Boolean);
for (const action of ['custom_url', 'page_post', 'download', 'woocommerce']) {
    for (const target of ['icon', 'thumbnail']) {
        for (const lightbox of [false, true]) {
            const context = { 'folioBlocks/lightboxTheme': 'light' };
            const args = { attributes: { imageClickTarget: target, lightbox }, imageClickAction: action, context, setAttributes: () => {} };
            const tree = sandbox.render(args);
            const control = find(tree, 'lightbox');
            assert.equal(!!control, target === 'icon' && lightbox);
            if (control) assert.equal(control.props.context, context);
            delete args.context;
            assert.doesNotThrow(() => sandbox.render(args));
        }
    }
}
console.log('Passed: Image link target controls render with lightbox enabled, disabled, with and without context.');
