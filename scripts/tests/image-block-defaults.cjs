const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<form class="fbks-global-settings-form">${fs.readFileSync('/private/tmp/folioblocks-block-defaults-fixture.html', 'utf8')}</form>`, { runScripts: 'outside-only' });
const { window } = dom;
window.folioBlocksGlobalSettingsAutosave = { ajaxUrl: '/fixture', nonce: 'fixture', hasWooCommerce: true };
window.fetch = async () => ({ ok: true, json: async () => ({ success: true }) });
window.eval(fs.readFileSync('includes/pro/js/global-settings.js', 'utf8'));
const card = window.document.querySelector('[data-settings-section="block_image"]');
const set = (name, value) => {
    const input = card.querySelector(`#fbks-default-image-${name}`);
    if (input.type === 'checkbox') input.checked = value; else input.value = value;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const visible = name => !card.querySelector(`[data-image-default-condition="${name}"]`).hidden;
set('imageClickAction', 'none'); assert(!visible('lightbox')); assert(!visible('link-target'));
set('imageClickAction', 'lightbox'); assert(visible('lightbox')); assert(!visible('download-icon'));
set('imageClickAction', 'download'); set('imageClickTarget', 'icon'); set('lightbox', true);
assert(visible('download-icon') && visible('lightbox'));
set('imageClickTarget', 'thumbnail'); assert(!visible('download-icon') && !visible('lightbox'));
set('onHoverStyle', 'none'); assert(!visible('overlay') && !visible('entrance'));
set('onHoverStyle', 'color-overlay'); assert(visible('overlay') && visible('color') && visible('overlay-text') && visible('entrance')); assert(!visible('chip'));
set('onHoverStyle', 'chip-gradient'); assert(visible('chip-gradient') && visible('chip-text')); assert(!visible('gradient') && !visible('color') && !visible('entrance'));
set('onHoverStyle', 'gradient-overlay'); assert(visible('gradient') && visible('overlay-text') && visible('entrance'));
set('overlayContent', 'exif'); assert(visible('exif'));
set('overlayContent', 'title'); assert(!visible('exif'));
card.querySelector('[data-reset-block-defaults]').click();
assert.equal(card.querySelector('#fbks-default-image-imageClickAction').value, 'none');
assert.equal(card.querySelector('#fbks-default-image-onHoverStyle').value, 'none');
assert(!visible('overlay') && !visible('lightbox'));
const video = window.document.querySelector('[data-settings-section="block_video"]');
const changeVideo = (name, value) => {
    const input = video.querySelector(`#fbks-default-video-${name}`);
    input.value = value;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const videoVisible = name => !video.querySelector(`[data-image-default-condition="${name}"]`).hidden;
changeVideo('overlayStyle', 'default'); assert(!videoVisible('video-color') && !videoVisible('video-gradient') && !videoVisible('video-text'));
changeVideo('overlayStyle', 'color'); assert(videoVisible('video-color') && videoVisible('video-text') && !videoVisible('video-gradient'));
changeVideo('overlayStyle', 'gradient'); assert(videoVisible('video-gradient') && videoVisible('video-text') && !videoVisible('video-color'));
changeVideo('defaultOverlayContent', 'none'); assert(!videoVisible('video-content'));
changeVideo('defaultOverlayContent', 'play'); assert(videoVisible('video-content'));
video.querySelector('[data-reset-block-defaults]').click();
assert(!videoVisible('video-gradient') && !videoVisible('video-text') && videoVisible('video-content'));
for (const key of ['before_after', 'background_video', 'loupe', 'video']) {
    assert(window.document.querySelector(`[data-settings-section="block_${key}"] .fbks-block-default-group-title`), `${key}: missing section headings`);
}
for (const key of ['carousel', 'filmstrip']) {
    const gallery = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const change = (name, value) => {
        const input = gallery.querySelector(`#fbks-default-${key}-${name}`);
        if (input.type === 'checkbox') input.checked = value; else input.value = value;
        input.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    const shown = name => !gallery.querySelector(`[data-image-default-condition="${name}"]`).hidden;
    assert(!shown('autoplay')); change('autoplay', true); assert(shown('autoplay'));
    if (key === 'carousel') { change('showControls', true); assert(shown('controls')); }
    change('imageClickAction', 'download'); assert(shown('download') && shown('secondary-lightbox'));
    change('lightbox', true); assert(shown('lightbox'));
    change('imageClickTarget', 'thumbnail'); assert(!shown('secondary-lightbox') && !shown('lightbox'));
    change('imageClickAction', 'custom_url'); change('imageClickTarget', 'icon'); assert(shown('link-icon'));
    assert(shown('secondary-lightbox'));
    change('onHoverStyle', 'chip-gradient'); assert(shown('chip-gradient') && !shown('color'));
    gallery.querySelector('[data-reset-block-defaults]').click();
    assert(!shown('autoplay') && !shown('chip-gradient') && !shown('download'));
}
const videoGallery = window.document.querySelector('[data-settings-section="block_video_gallery"]');
const changeGallery = (name, value) => {
    const input = videoGallery.querySelector(`#fbks-default-video_gallery-${name}`);
    if (input.type === 'checkbox') input.checked = value; else input.value = value;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const galleryShown = name => !videoGallery.querySelector(`[data-image-default-condition="${name}"]`).hidden;
assert(!galleryShown('filter') && !galleryShown('commerce'));
changeGallery('enableFilter', true); assert(galleryShown('filter'));
changeGallery('defaultOverlayContent', 'title-play-category');
changeGallery('enableFilter', false);
assert.equal(videoGallery.querySelector('#fbks-default-video_gallery-defaultOverlayContent').value, 'title-play');
changeGallery('enableWooCommerce', true); assert(galleryShown('commerce'));
changeGallery('lightboxLayout', 'video-product');
changeGallery('enableWooCommerce', false); assert(!galleryShown('commerce'));
assert.equal(videoGallery.querySelector('#fbks-default-video_gallery-lightboxLayout').value, 'split');
changeGallery('overlayStyle', 'gradient'); assert(galleryShown('video-gradient'));
videoGallery.querySelector('[data-reset-block-defaults]').click();
assert(!galleryShown('filter') && !galleryShown('commerce') && !galleryShown('video-gradient'));
const modularCard = window.document.querySelector('[data-settings-section="block_modular"]');
assert(modularCard.querySelector('#fbks-default-modular-collapseOnMobile'));
assert(!modularCard.querySelector('#fbks-default-modular-autoplay'));
const modularAction = modularCard.querySelector('#fbks-default-modular-imageClickAction');
modularAction.value = 'lightbox'; modularAction.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(!modularCard.querySelector('[data-image-default-condition="lightbox"]').hidden);
modularCard.querySelector('[data-reset-block-defaults]').click();
assert(modularCard.querySelector('[data-image-default-condition="lightbox"]').hidden);
const grid = window.document.querySelector('[data-settings-section="block_grid"]');
const gridFiltering = grid.querySelector('#fbks-default-grid-enableFilter');
const filterHeading = grid.querySelector('.fbks-block-default-group-title[data-image-default-condition="filter"]');
assert(filterHeading.hidden);
gridFiltering.checked = true; gridFiltering.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(!filterHeading.hidden);
grid.querySelector('[data-reset-block-defaults]').click(); assert(filterHeading.hidden);
assert.equal(grid.querySelector('#fbks-default-grid-columns').value, '6');
assert.equal(grid.querySelector('#fbks-default-grid-tabletColumns').value, '4');
assert.equal(grid.querySelector('#fbks-default-grid-mobileColumns').value, '2');
const justified = window.document.querySelector('[data-settings-section="block_justified"]');
justified.querySelector('[data-reset-block-defaults]').click();
assert.equal(justified.querySelector('#fbks-default-justified-rowHeight').value, '250');
for (const name of ['tabletRowHeight', 'mobileRowHeight']) {
    const slider = justified.querySelector(`#fbks-default-justified-${name}`);
    assert.equal(slider.type, 'range');
    assert.equal(slider.value, '250');
    slider.value = '450';
}
assert(!justified.querySelector('[data-block-inherit-toggle]'));
justified.querySelector('[data-reset-block-defaults]').click();
assert.equal(justified.querySelector('#fbks-default-justified-mobileRowHeight').value, '250');
const justifiedFilter = justified.querySelector('#fbks-default-justified-enableFilter');
justifiedFilter.checked = true; justifiedFilter.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(!justified.querySelector('.fbks-block-default-group-title[data-image-default-condition="filter"]').hidden);
const masonry = window.document.querySelector('[data-settings-section="block_masonry"]');
masonry.querySelector('[data-reset-block-defaults]').click();
for (const [name, value] of Object.entries({columns: '6', tabletColumns: '4', mobileColumns: '2', gap: '10', tabletGap: '10', mobileGap: '10'})) {
    const control = masonry.querySelector(`#fbks-default-masonry-${name}`);
    assert.equal(control.type, 'range'); assert.equal(control.value, value);
}
const masonryFilter = masonry.querySelector('#fbks-default-masonry-enableFilter');
masonryFilter.checked = true; masonryFilter.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(!masonry.querySelector('.fbks-block-default-group-title[data-image-default-condition="filter"]').hidden);
const proofing = window.document.querySelector('[data-settings-section="block_proofing"]');
proofing.querySelector('[data-reset-block-defaults]').click();
const flagModeAdvanced = proofing.querySelector('#fbks-default-proofing-flagMode input[value="advanced"]');
flagModeAdvanced.checked = true; flagModeAdvanced.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(!proofing.querySelector('[data-image-default-condition="proofing-palette"]').hidden);
const flagsEnabled = proofing.querySelector('#fbks-default-proofing-enableFlag');
flagsEnabled.checked = false; flagsEnabled.dispatchEvent(new window.Event('change', { bubbles: true }));
assert(proofing.querySelector('[data-image-default-condition="proofing-palette"]').hidden);
proofing.querySelector('[data-reset-block-defaults]').click();
assert(proofing.querySelector('#fbks-default-proofing-flagMode input[value="simple"]').checked);
assert(proofing.querySelector('[data-image-default-condition="proofing-palette"]').hidden);
console.log('Passed: click-dependent controls, download targets, overlay styles, gradients, EXIF visibility and reset.');

// Reviewed galleries share click ordering, conditional styles and commerce behavior.
for (const key of ['carousel', 'filmstrip', 'grid', 'justified', 'masonry', 'modular']) {
    const card = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const input = name => card.querySelector(`#fbks-default-${key}-${name}`);
    const change = (name, value) => {
        if (input(name).type === 'checkbox') input(name).checked = value; else input(name).value = value;
        input(name).dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    const visible = name => !card.querySelector(`[data-image-default-condition="${name}"]`).hidden;
    assert(input('imageClickTarget').compareDocumentPosition(input('downloadDisplay')) & window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert(input('downloadDisplay').compareDocumentPosition(input('lightbox')) & window.Node.DOCUMENT_POSITION_FOLLOWING);
    const headings = [...card.querySelectorAll('.fbks-block-default-group-title')];
    assert.equal(headings[headings.findIndex(el => el.textContent === (key === 'filmstrip' ? 'Gallery Styles' : 'Gallery Image Styles')) + 1].textContent, 'Gallery Click Styles');
    assert.equal(headings[headings.findIndex(el => el.textContent === 'Gallery Click Styles') + 1].textContent, 'Gallery Hover Styles');
    for (const style of ['none', 'blur-overlay', 'fade-overlay', 'gradient-bottom', 'color-overlay', 'gradient-overlay', 'chip', 'chip-gradient']) {
        change('onHoverStyle', style);
        assert.equal(visible('hover-styles'), ['color-overlay', 'gradient-overlay', 'chip', 'chip-gradient'].includes(style));
    }
    const stylesHeading = headings.find(el => el.textContent === 'Gallery Hover Styles');
    for (const name of ['overlayBgColor', 'overlayTextColor', 'chipOverlayBgColor', 'chipOverlayTextColor', 'overlayBgGradient', 'chipOverlayBgGradient']) {
        const field = input(name).closest('.fbks-block-default-field');
        let heading = field.previousElementSibling;
        while (heading && !heading.classList.contains('fbks-block-default-group-title')) heading = heading.previousElementSibling;
        assert.equal(heading, stylesHeading);
    }
    change('imageClickAction', 'none'); assert(!visible('click-styles'));
    change('imageClickAction', 'download'); assert(visible('click-styles'));
    change('imageClickAction', 'page_post'); change('imageClickTarget', 'icon'); change('linkIconDisplay', 'none'); assert(!visible('click-styles'));
    change('linkIconDisplay', 'hover'); assert(visible('click-styles'));
    change('imageClickAction', 'woocommerce'); assert(visible('commerce') && visible('cart-icon'));
    change('lightbox', true); assert(visible('lightbox'));
    change('wooCartIconDisplay', 'none'); assert(!visible('cart-icon') && !visible('click-styles'));
    change('imageClickTarget', 'thumbnail'); assert(!visible('secondary-lightbox') && !visible('lightbox'));
    window.folioBlocksGlobalSettingsAutosave.hasWooCommerce = false;
    change('imageClickAction', 'none');
    assert(input('imageClickAction').querySelector('option[value="woocommerce"]').disabled);
    window.folioBlocksGlobalSettingsAutosave.hasWooCommerce = true;
}
console.log('Passed: reviewed photo gallery click order, conditional icon styles, WooCommerce controls and availability.');

// Photo galleries keep behavior controls and expose conditional style sections.
for (const key of ['grid', 'justified', 'masonry', 'modular']) {
    const card = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const input = name => card.querySelector(`#fbks-default-${key}-${name}`);
    const change = (name, value) => { input(name).value = value; input(name).dispatchEvent(new window.Event('change', { bubbles: true })); };
    const heading = text => [...card.querySelectorAll('.fbks-block-default-group-title')].find(el => el.textContent === text);
    assert.equal(heading('Gallery Image Styles').nextElementSibling.classList.contains('fbks-block-default-field'), true);
    const headings = [...card.querySelectorAll('.fbks-block-default-group-title')].map(el => el.textContent);
    assert.deepEqual(headings.slice(headings.indexOf('Gallery Image Styles'), headings.indexOf('Gallery Image Styles') + 3), ['Gallery Image Styles', 'Gallery Click Styles', 'Gallery Hover Styles']);
    for (const [group, names] of Object.entries({
        'Gallery Click Styles': ['downloadIconColor', 'downloadIconBgColor', 'linkIconColor', 'linkIconBgColor'],
        'Gallery Hover Styles': ['overlayBgColor', 'overlayTextColor', 'chipOverlayBgColor', 'chipOverlayTextColor', 'overlayBgGradient', 'chipOverlayBgGradient'],
    })) {
        for (const name of names) {
            let previous = input(name).closest('.fbks-block-default-field').previousElementSibling;
            while (previous && !previous.classList.contains('fbks-block-default-group-title')) previous = previous.previousElementSibling;
            assert.equal(previous, heading(group));
        }
    }
    change('imageClickAction', 'none'); assert(heading('Gallery Click Styles').hidden);
    change('imageClickAction', 'download'); assert(!heading('Gallery Click Styles').hidden);
    change('imageClickAction', 'page_post'); change('imageClickTarget', 'icon'); change('linkIconDisplay', 'none'); assert(heading('Gallery Click Styles').hidden);
    change('linkIconDisplay', 'hover'); assert(!heading('Gallery Click Styles').hidden);
    change('onHoverStyle', 'none'); assert(heading('Gallery Hover Styles').hidden);
    for (const style of ['color-overlay', 'gradient-overlay', 'chip', 'chip-gradient']) {
        change('onHoverStyle', style); assert(!heading('Gallery Hover Styles').hidden);
    }
}
console.log('Passed: Grid, Justified, Masonry and Modular style grouping, heading order and conditional visibility.');

// Standalone Image uses display selectors, style sections and commerce.
{
    const card = window.document.querySelector('[data-settings-section="block_image"]');
    const input = name => card.querySelector(`#fbks-default-image-${name}`);
    const visible = condition => !card.querySelector(`[data-image-default-condition="${condition}"]`).hidden;
    const heading = text => [...card.querySelectorAll('.fbks-block-default-group-title')].find(el => el.textContent === text);
    assert.equal(input('downloadDisplay').tagName, 'SELECT');
    assert(!input('downloadOnHover'));
    assert.equal(input('borderWidth').type, 'range');
    for (const name of ['linkIconColor', 'linkIconBgColor', 'cartIconColor', 'cartIconBgColor']) assert.equal(input(name).type, 'color');
    set('imageClickAction', 'none'); set('onHoverStyle', 'none');
    assert(heading('Image Click Styles').hidden && heading('Image Hover Styles').hidden);
    for (const action of ['custom_url', 'page_post', 'woocommerce']) {
        set('imageClickAction', action); set('imageClickTarget', 'icon'); set('lightbox', true);
        assert(visible('secondary-lightbox') && visible('lightbox'));
        set('imageClickTarget', 'thumbnail'); assert(!visible('secondary-lightbox') && !visible('lightbox'));
    }
    set('imageClickAction', 'woocommerce'); set('imageClickTarget', 'icon');
    assert(visible('commerce') && visible('cart-icon'));
    set('onHoverStyle', 'blur-overlay'); set('overlayContent', 'product');
    assert(visible('product-overlay'));
    assert(heading('Image Hover Styles').hidden);
    for (const name of ['overlayFontFamily', 'overlayFontWeight', 'overlayFontStyle']) assert(!input(name));
    set('overlayContent', 'exif'); assert(heading('Image Hover Styles').hidden);
    set('onHoverStyle', 'color-overlay'); assert(!heading('Image Hover Styles').hidden);
    card.querySelector('[data-reset-block-defaults]').click();
    assert.equal(input('downloadDisplay').value, 'hover');
    assert(heading('Image Click Styles').hidden && heading('Image Hover Styles').hidden);
}
console.log('Passed: Image display controls, missing colors, style sections and WooCommerce.');

for (const [key, title] of [['video', 'Video Hover Styles'], ['video_gallery', 'Gallery Hover Styles']]) {
    const card = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const heading = [...card.querySelectorAll('.fbks-block-default-group-title')].find(el => el.textContent === title);
    assert(heading);
    for (const name of ['overlayBgColor', 'overlayBgGradient', 'overlayTextColor']) {
        let previous = card.querySelector(`#fbks-default-${key}-${name}`).closest('.fbks-block-default-field').previousElementSibling;
        while (previous && !previous.classList.contains('fbks-block-default-group-title')) previous = previous.previousElementSibling;
        assert.equal(previous, heading);
    }
    const style = card.querySelector(`#fbks-default-${key}-overlayStyle`);
    for (const value of ['default', 'blur', 'color', 'gradient']) {
        style.value = value; style.dispatchEvent(new window.Event('change', { bubbles: true }));
        assert.equal(heading.hidden, !['color', 'gradient'].includes(value));
    }
}
console.log('Passed: Video and Video Gallery hover style grouping and conditional headings.');

for (const key of ['image', 'carousel', 'filmstrip', 'grid', 'justified', 'modular', 'masonry']) {
    const card = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const action = card.querySelector(`#fbks-default-${key}-imageClickAction`);
    action.value = 'video_lightbox'; action.dispatchEvent(new window.Event('change', {bubbles: true}));
    assert(!card.querySelector('[data-image-default-condition="lightbox"]').hidden);
    assert(card.querySelector('[data-image-default-condition="lightbox-zoom"]').hidden);
    assert(!card.querySelector(`#fbks-default-${key}-overlayContent option[value="video_play"]`).disabled);
    assert(card.querySelector(`#fbks-default-${key}-linkIconDisplay option[value="none"]`).disabled);
    assert(!card.querySelector(`#fbks-default-${key}-videoLightboxUrl`));
}
console.log('Passed: video lightbox defaults visibility, zoom exclusion, and per-image-only sources.');

// Image global defaults mirror the settled editor without per-image data or a counter.
{
    const card = window.document.querySelector('[data-settings-section="block_image"]');
    const input = name => card.querySelector(`#fbks-default-image-${name}`);
    const change = (name,value) => { input(name).value=value; input(name).dispatchEvent(new window.Event('change',{bubbles:true})); };
    const options = Array.from(input('imageClickAction').options);
    assert.equal(options[options.findIndex(option=>option.value==='woocommerce')-1].value,'video_lightbox');
    assert.equal(options.find(option=>option.value==='download').textContent,'Enable Image Downloads');
    assert.deepEqual(Array.from(input('imageClickTarget').options,option=>option.textContent),['Icon','Thumbnail']);
    assert(!input('videoLightboxUrl') && !input('lightboxCounter'));
    assert(!input('overlayFontFamily') && !input('overlayFontWeight') && !input('overlayFontStyle'));
    change('imageClickAction','video_lightbox'); change('imageClickTarget','icon');
    assert(card.querySelector('[data-image-default-condition="secondary-lightbox"]').hidden);
    assert(card.querySelector('[data-image-default-condition="lightbox-zoom"]').hidden);
    assert(!card.querySelector('[data-image-default-condition="link-icon"]').hidden);
    assert(!card.querySelector('[data-image-default-condition="lightbox"]').hidden);
    const display = Array.from(input('linkIconDisplay').options).filter(option=>!option.hidden && !option.disabled);
    assert.deepEqual(display.map(option=>option.textContent),['On Hover','Always']);
    change('imageClickTarget','thumbnail');
    assert(card.querySelector('[data-image-default-condition="link-icon"]').hidden);
    assert(card.querySelector('.fbks-block-default-group-title[data-image-default-condition="click-styles"]').hidden);
    change('onHoverStyle','color-overlay'); change('overlayContent','video_play');
    assert(!card.querySelector('.fbks-block-default-group-title[data-image-default-condition="hover-styles"]').hidden);
    change('imageClickAction','lightbox');
    assert.equal(input('overlayContent').value,'title');
    assert(input('overlayContent').querySelector('option[value="video_play"]').disabled);
}
console.log('Passed: Image global default labels/order, video controls, icon targeting, omitted local settings and inactive play overlay reset.');

// All photo gallery defaults expose the settled video behavior, counter and style conditions.
for (const key of ['carousel','filmstrip','grid','justified','modular','masonry']) {
    const card = window.document.querySelector(`[data-settings-section="block_${key}"]`);
    const input = name => card.querySelector(`#fbks-default-${key}-${name}`);
    const change = (name,value) => { input(name).value=value; input(name).dispatchEvent(new window.Event('change',{bubbles:true})); };
    const choices = Array.from(input('imageClickAction').options);
    assert.equal(choices[choices.findIndex(option=>option.value==='woocommerce')-1].value,'video_lightbox');
    assert.equal(choices.find(option=>option.value==='download').textContent,'Enable Image Downloads');
    assert.deepEqual(Array.from(input('imageClickTarget').options,option=>option.textContent),['Icon','Thumbnail']);
    assert(!input('videoLightboxUrl') && input('lightboxCounter'));
    change('imageClickAction','video_lightbox'); change('imageClickTarget','icon');
    assert.deepEqual(Array.from(input('linkIconDisplay').options).filter(option=>!option.hidden&&!option.disabled).map(option=>option.textContent),['On Hover','Always']);
    for(const name of ['linkIconDisplay','lightboxTheme','lightboxContent','lightboxCounter']) assert(!input(name).closest('[data-image-default-condition]').hidden,key+': '+name);
    assert(card.querySelector('[data-image-default-condition="lightbox-zoom"]').hidden);
    for(const [first,second] of [['imageClickTarget','linkIconDisplay'],['linkIconDisplay','lightboxTheme'],['lightboxTheme','lightboxContent'],['lightboxContent','lightboxCounter']]) assert(input(first).compareDocumentPosition(input(second)) & window.Node.DOCUMENT_POSITION_FOLLOWING);
    for(const style of ['blur-overlay','fade-overlay','gradient-bottom','chip','chip-gradient','color-overlay','gradient-overlay']) {
        change('onHoverStyle',style); change('overlayContent','video_play');
        assert(!input('overlayContent').querySelector('option[value="video_play"]').disabled);
    }
    change('imageClickTarget','thumbnail');
    assert(input('linkIconDisplay').closest('[data-image-default-condition]').hidden);
    assert(card.querySelector('.fbks-block-default-group-title[data-image-default-condition="click-styles"]').hidden);
    change('imageClickAction','none'); assert.equal(input('overlayContent').value,'title');
}
console.log('Passed: six gallery global video defaults, labels/order, counters, icon styles, overlay choices and inactive reset.');

window.close();
