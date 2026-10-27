const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const exportsObject = {};
let justInserted, writes, ref, parents = [], childCount = 0, blockTree = [];
const defaults = { magnification: 15, loupeShape: 'square', unknown: 'ignored' };
const context = { exports: exportsObject, window: { folioBlocksData: { isPro: true, blockDefaults: { loupe: defaults } } }, require(name) {
    if (name === '@wordpress/element') return { useRef: () => ref, useEffect: fn => fn() };
    if (name === '@wordpress/data') return { useSelect: fn => fn(() => ({ wasBlockJustInserted: () => justInserted, getBlockParents: () => parents, getBlockCount: () => childCount, getBlocks: () => blockTree })) };
    throw new Error(name);
} };
vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/useGlobalBlockDefaults.js', 'utf8'), { babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code, context);
const schema = { magnification: { default: 10 }, loupeShape: { default: 'circle' } };
const run = (attributes, inserted = true, inheritGallery = false) => { justInserted = inserted; writes = []; ref = { current: false }; exportsObject.default('id', 'loupe', attributes, value => writes.push(value), schema, inheritGallery); return writes; };
assert.equal(run({ magnification: 10 }, false).length, 0);
assert.equal(run({ magnification: 10 })[0].magnification, 15);
assert.equal(run({ magnification: 12 })[0].magnification, undefined);
assert.equal(run({ id: 123, magnification: 10 })[0].magnification, undefined);
assert.equal(run({ globalDefaultsApplied: true }).length, 0);
assert.equal(run({ preview: true }).length, 0);
assert.equal(run({}, true, true).length, 0);
assert.equal(run({ videoUrl: 'https://example.invalid/video.mp4' })[0].magnification, undefined);
context.window.folioBlocksData.isPro = false;
assert.equal(run({}).length, 0);
console.log('Passed: new block initialization, saved block protection, explicit overrides, media-bearing content, applied markers, previews and unpaid builds.');

for (const blockName of ['folioblocks/pb-image-block', 'folioblocks/pb-video-block']) {
    context.window.folioBlocksData.isPro = true;
    justInserted = true;
    ref = { current: false }; writes = []; parents = ['group'];
    exportsObject.default('id', blockName, {}, value => writes.push(value), schema);
    assert.equal(writes.length, 0, `${blockName}: nested defaults applied`);
    parents = []; ref = { current: false };
    exportsObject.default('id', blockName, {}, value => writes.push(value), schema);
    assert.equal(writes.length, 1, `${blockName}: top-level initialization missing`);
}
console.log('Passed: Image and Video skip all parent blocks and initialize at the top level.');

for (const blockName of ['folioblocks/carousel-gallery-block', 'folioblocks/filmstrip-gallery-block', 'folioblocks/video-gallery-block', 'folioblocks/grid-gallery-block', 'folioblocks/justified-gallery-block', 'folioblocks/masonry-gallery-block', 'folioblocks/proofing-gallery-block']) {
    context.window.folioBlocksData.blockDefaults[blockName] = defaults;
    for (const count of [0, 2]) {
        childCount = count; justInserted = true; writes = []; ref = { current: false };
        exportsObject.default('id', blockName, {}, value => writes.push(value), schema);
        assert.equal(writes[0].magnification, count ? undefined : 15);
    }
}
console.log('Passed: new galleries receive defaults; populated galleries retain configuration.');

const modularName = 'folioblocks/modular-gallery-block';
context.window.folioBlocksData.blockDefaults[modularName] = defaults;
for (const media of [false, true]) {
    blockTree = [{ name: 'folioblocks/pb-image-row', attributes: {}, innerBlocks: [{ name: 'folioblocks/pb-image-stack', attributes: {}, innerBlocks: media ? [{ attributes: { id: 123 }, innerBlocks: [] }] : [] }] }];
    justInserted = true; writes = []; ref = { current: false };
    exportsObject.default('id', modularName, {}, value => writes.push(value), schema);
    assert.equal(writes[0].magnification, media ? undefined : 15);
}
console.log('Passed: Modular empty rows receive defaults; nested media preserves gallery settings.');

justInserted = true; writes = []; ref = { current: false };
exportsObject.default('id', 'folioblocks/grid-gallery-block', {}, value => writes.push(value), schema, true);
assert.equal(writes.length, 0, 'Proofing child Grid received global defaults');

justInserted = true; writes = []; ref = { current: false };
exportsObject.default('id', 'folioblocks/masonry-gallery-block', {}, value => writes.push(value), schema, true);
assert.equal(writes.length, 0, 'Proofing child Masonry received global defaults');

assert(exportsObject.getInitialBlockDefaults({flagPalette: {}}, {flagPalette: {items: [{value: 'class-1'}]}}, {flagPalette: {default: {}}}).flagPalette);
assert.equal(exportsObject.getInitialBlockDefaults({flagPalette: {items: ['retained']}}, {flagPalette: {items: ['new']}}, {flagPalette: {default: {}}}).flagPalette, undefined);
