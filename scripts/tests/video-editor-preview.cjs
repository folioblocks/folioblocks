const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const validationExports = {};
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/urlValidation.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code, { exports: validationExports, URL });
const providerExports = {};
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/videoProviders.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code, { exports: providerExports, URL, URLSearchParams, require: name => { assert.equal(name, './urlValidation'); return validationExports; } });
const source = fs.readFileSync('src/video-block/edit.js', 'utf8');
const ast = babel.parseSync(source, { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } });
let preview;
traverse(ast, { FunctionDeclaration(path) {
    if (path.node.id.name === 'getVideoEmbedMarkup') preview = source.slice(path.node.start, path.node.end);
} });
assert(preview);
const sandbox = { ...providerExports, React: { createElement: (type, props) => ({ type, props }) } };
vm.runInNewContext(babel.transformSync(`${preview}\nthis.preview = getVideoEmbedMarkup;`, {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-react-jsx'],
}).code, sandbox);
for (const [url, host] of [
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'www.youtube.com'],
    ['https://www.dailymotion.com/video/x123abc', 'geo.dailymotion.com'],
    ['https://vimeo.com/123456789', 'player.vimeo.com'],
]) {
    const result = sandbox.preview(url, true);
    assert.equal(result.type, 'iframe');
    assert.equal(new URL(result.props.src).hostname, host);
    assert(!result.props.sandbox && !result.props.srcDoc);
    assert(result.props.title && result.props.allowFullScreen);
}
assert.equal(sandbox.preview('', true), null);
assert.equal(sandbox.preview('https://example.com/video.mp4', true).type, 'video');
console.log('Passed: provider previews use direct iframes without SandBox document rewriting; self-hosted video remains native.');
