/** Run after render-proofing-fixtures.php. Exercises the real store without a browser or database writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');
const pages = JSON.parse(fs.readFileSync('/private/tmp/folioblocks-proofing-fixtures.json', 'utf8'));
const css = fs.readFileSync('build/proofing-gallery-block/style-index.css', 'utf8');
const dom = new JSDOM(`<style>${css}</style>${pages['/stars']}${pages['/stars-dark']}`, { url: 'http://localhost/' });
const { window } = dom;
let context, ref, config;
const requests = [];
window.fetch = async (url, options) => {
    const payload = JSON.parse(options.body);
    requests.push(payload);
    return { ok: true, json: async () => ({ images: payload.images, updatedAt: 'test' }) };
};
const source = babel.transformSync(fs.readFileSync('src/proofing-gallery-block/view.js', 'utf8'), {
    babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-modules-commonjs'],
}).code;
vm.runInNewContext(source, {
    window, document: window.document, Event: window.Event, console,
    require(name) {
        if (name === '@wordpress/interactivity') return {
            getContext: () => { if (!context) throw new Error("getContext called outside a scope"); return context; }, getElement: () => ({ ref }),
            store: (name, value) => { config = value; return value; },
        };
        if (name === '../fbks-helpers/frontendScope') return { createFrontendScope: () => {
            const controller = new AbortController();
            return { signal: controller.signal, frame: fn => fn(), dispose: () => controller.abort() };
        } };
        if (name === '../fbks-helpers/proofingRatings') { const exports = {}; vm.runInNewContext(babel.transformSync(fs.readFileSync('src/fbks-helpers/proofingRatings.js', 'utf8'), { babelrc:false, configFile:false, plugins:['@babel/plugin-transform-modules-commonjs'] }).code, { exports }); return exports; }
        throw new Error(name);
    },
});
const roots = [...window.document.querySelectorAll('.fbks-proofing-gallery')];
const bind = (root, savedSession = {}) => {
    const data = JSON.parse(root.dataset.wpContext);
    context = undefined;
    config.actions.registerGallery(data.galleryId, {
        ...data, element: root, trackPresence: false,
        restUrl: '/mock-session', savedSession,
    });
    for (const controls of root.querySelectorAll('.fbks-proofing-thumbnail-controls')) {
        ref = controls; context = { ...data, ...JSON.parse(controls.dataset.wpContext) };
        config.callbacks.registerImage();
    }
    return data;
};
const first = bind(roots[0]);
const second = bind(roots[1]);
const controls = roots[0].querySelector('.fbks-proofing-thumbnail-controls');
const image = controls.closest('.wp-block-folioblocks-pb-image-block');
const imageData = JSON.parse(controls.dataset.wpContext);
const select = node => { ref = node; context = { ...first, ...imageData }; };
const event = { preventDefault() {}, stopPropagation() {} };
const trigger = controls.querySelector('.fbks-proofing-thumbnail-control--rating');
const comment = controls.querySelector('.fbks-proofing-thumbnail-control--comment');
assert.equal(window.getComputedStyle(trigger).bottom, '8px');
assert.equal(window.getComputedStyle(trigger).left, '8px');
assert.equal(window.getComputedStyle(comment).bottom, '8px');
assert.equal(window.getComputedStyle(comment).right, '8px');
assert.equal(config.state.galleries[first.galleryId].images[imageData.imageId].clientRating, null);
select(trigger); config.actions.toggleRatingPanel({ ...event, detail: 0 });
assert.equal(config.state.isCurrentImageRatingPanelOpen, true);
assert.equal(window.document.activeElement, controls.querySelector('.fbks-proofing-rating-slider'));
const slider = controls.querySelector('.fbks-proofing-rating-slider');
slider.getBoundingClientRect = () => ({ left: 0, width: 100 });
select(slider); config.actions.startRatingDrag({ ...event, clientX: 15 });
assert.equal(config.state.currentRatingSliderValue, 1);
config.actions.previewRating({ clientX: 75 });
assert.equal(config.state.currentRatingSliderValue, 4);
config.actions.commitRatingDrag({ clientX: 75 });
config.actions.startRatingDrag({ ...event, clientX: 99 });
config.actions.cancelRatingDrag();
assert.equal(config.state.currentRatingSliderValue, 4);
config.actions.ratingSliderKeyDown({ ...event, key: 'ArrowLeft' });
assert.equal(config.state.currentRatingSliderValue, 3);
config.actions.ratingSliderKeyDown({ ...event, key: 'ArrowRight' });
config.actions.closeRatingPanel(event);
assert.equal(config.state.galleries[first.galleryId].images[imageData.imageId].clientRating, 4);
assert.equal(config.state.galleries[second.galleryId].images[imageData.imageId].clientRating, null);
assert.equal(image.dataset.proofingRating, '4');
assert.equal(window.document.activeElement, trigger);
select(trigger); assert.equal(config.state.currentImageRatingText, 4);
assert.equal(config.state.currentImageRatingLabel, 'Client rating: 4/5');
const filterSlider = roots[0].querySelector('.fbks-proofing-rating-filter [role=slider]');
assert(filterSlider);
assert.equal(roots[0].querySelectorAll('.fbks-proofing-filter-rating').length, 0);
filterSlider.getBoundingClientRect = () => ({ left: 0, width: 100 });
ref = filterSlider; context = first;
config.actions.startRatingFilterDrag({ ...event, clientX: 10 });
config.actions.commitRatingFilterDrag({ clientX: 80 });
assert.equal(config.state.ratingFilterValue, 4);
assert.equal(roots[0].querySelectorAll('.wp-block-folioblocks-pb-image-block:not(.is-hidden)').length, 1);
config.actions.ratingFilterKeyDown({ ...event, key: 'ArrowLeft' });
assert.equal(config.state.ratingFilterValue, 3);
assert.equal(roots[0].querySelectorAll('.wp-block-folioblocks-pb-image-block:not(.is-hidden)').length, 0);
config.actions.startRatingFilterDrag({ ...event, clientX: 60 });
config.actions.commitRatingFilterDrag({ clientX: -5 });
assert.equal(config.state.galleries[first.galleryId].activeFilter, 'all');
assert.equal(roots[0].querySelectorAll('.wp-block-folioblocks-pb-image-block:not(.is-hidden)').length, 3);
select(trigger);
config.actions.toggleRatingPanel({ ...event, detail: 0 }); config.actions.ratingPanelKeyDown({ ...event, key: 'Escape' });
assert.equal(config.state.isCurrentImageRatingPanelOpen, false);
(async () => {
    select(trigger); await config.actions.saveProgress(event);
    assert.equal(requests.at(-1).images[0].clientRating, 4);
    assert.equal(JSON.parse(window.localStorage.getItem(`fbksProofingSession:${first.galleryKey}`)).images[0].clientRating, 4);
    // Restore ratings saved on the server; absent legacy fields remain null.
    const restored = config.actions.registerGallery('restored', {
        element: roots[0], galleryKey: 'restored', trackPresence: false,
        savedSession: { images: [ { imageId: imageData.imageId, clientRating: 4 }, { imageId: 'legacy', hearted: true } ] },
    });
    assert.equal(config.state.galleries.restored.images[imageData.imageId].clientRating, 4);
    assert.equal(config.state.galleries.restored.images.legacy.clientRating, null);
    restored();
    select(slider);
    config.actions.startRatingDrag({ ...event, clientX: 80 });
    config.actions.previewRating({ clientX: 0 });
    assert.equal(config.state.currentRatingSliderValue, 0);
    config.actions.commitRatingDrag({ clientX: -10 });
    assert.equal(image.dataset.proofingRating, '');
    assert.equal(controls.querySelector('.fbks-proofing-rating-clear'), null);
    assert.equal(config.state.galleries[first.galleryId].images[imageData.imageId].clientRating, null);
    select(trigger); await config.actions.submitProofing(event);
    assert.equal(requests.at(-1).images[0].clientRating, null);
    const legacy = new JSDOM(pages['/grid']).window.document;
    assert.equal(legacy.querySelectorAll('.fbks-proofing-thumbnail-control--rating').length, 0);
    assert(legacy.querySelector('.fbks-proofing-thumbnail-control--comment').classList.contains('fbks-proofing-thumbnail-control--slot-3'));
    assert.equal(new JSDOM(pages['/stars-only']).window.document.querySelectorAll('.fbks-proofing-thumbnail-control--rating').length, 3);
    window.document.body.insertAdjacentHTML('beforeend', pages['/advanced-flags']);
    const advancedRoot = window.document.querySelectorAll('.fbks-proofing-gallery')[2];
    const advancedData = bind(advancedRoot);
    const advancedControls = advancedRoot.querySelector('.fbks-proofing-thumbnail-controls');
    const advancedImage = JSON.parse(advancedControls.dataset.wpContext);
    ref = advancedControls.querySelector('[data-proofing-flag-color="class-4"]');
    context = { ...advancedData, ...advancedImage };
    config.actions.setFlagFromContext(event);
    assert.equal(config.state.currentImageFlagColor, '#2563eb');
    assert.equal(config.state.hasCurrentImageFlag, true);
    ref = advancedRoot.querySelector('[data-proofing-filter="flag-class-4"]');
    context = { ...advancedData, ...advancedImage, filter: 'flag-class-4' };
    config.actions.chooseFilter(event);
    assert.equal(advancedRoot.querySelectorAll('.wp-block-folioblocks-pb-image-block:not(.is-hidden)').length, 1);
    await config.actions.saveProgress(event);
    assert.equal(requests.at(-1).images[0].flag, 'class-4');
    context = undefined;
    const disposeAdvanced = config.actions.registerGallery('advanced-restored', {
        element: advancedRoot, galleryKey: 'advanced-restored', trackPresence: false,
        savedSession: { images: [ { imageId: advancedImage.imageId, flag: 'class-4' } ] },
    });
    assert.equal(advancedControls.querySelector('.fbks-proofing-thumbnail-control--flag').style.getPropertyValue('--fbks-proofing-flag-color'), 'rgb(37, 99, 235)');
    disposeAdvanced();
    console.log('Passed: advanced flag selection, configured color, exact filtering and session payload.');
    console.log('Passed: real rendered positions, keyboard focus/Escape, per-session ratings, save/submit payloads, local drafts, server restore, clear, legacy galleries and star-only galleries.');
})().catch(error => { console.error(error); process.exitCode = 1; });
