const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../..');
const wpRoot = path.resolve(root, '../../..');
const fixtures = JSON.parse(fs.readFileSync('/private/tmp/fbks-image-video-fixtures.json', 'utf8'));
const galleries = ['carousel', 'filmstrip', 'grid', 'justified', 'modular', 'masonry'];
const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="steelblue"/></svg>';
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost').pathname;
    if (url === '/interactivity.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(fs.readFileSync(path.join(wpRoot, 'wp-includes/js/dist/script-modules/interactivity/index.min.js'))); }
    if (url === '/test.mp4') {
        const bytes = fs.readFileSync(process.env.FBKS_TEST_VIDEO || '/private/tmp/fbks-lightbox-test.mp4');
        res.setHeader('Content-Type', 'video/mp4'); res.setHeader('Content-Length', bytes.length); return res.end(bytes);
    }
    if (url.startsWith('/build/')) {
        const file = path.join(root, url);
        if (!fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
        res.setHeader('Content-Type', url.endsWith('.css') ? 'text/css' : 'text/javascript'); return res.end(fs.readFileSync(file));
    }
    if (!(url in fixtures)) { res.statusCode = 404; return res.end(); }
    const gallery = galleries.find(name => url === '/' + name);
    const blocks = ['image-block', ...(gallery ? [gallery + '-gallery-block'] : [])];
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><html><head><meta charset="utf-8"><script type="importmap">{"imports":{"@wordpress/interactivity":"/interactivity.js"}}</script>${blocks.map(b => `<link rel="stylesheet" href="/build/${b}/style-index.css">`).join('')}</head><body>${fixtures[url].replaceAll('http://127.0.0.1:1/test.mp4', `http://127.0.0.1:${server.address().port}/test.mp4`)}${blocks.flatMap(b => ['view.js', 'premium-view.js'].map(f => `<script type="module" src="/build/${b}/${f}"></script>`)).join('')}</body></html>`);
});
(async () => {
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        const base = `http://127.0.0.1:${server.address().port}`;
        browser = await chromium.launch({headless: true, channel: 'chrome'});
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', async route => {
            const url = route.request().url();
            if (url.startsWith(base)) return route.continue();
            if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: picture });
            if (route.request().resourceType() === 'document') return route.fulfill({ contentType: 'text/html', body: '<html><body>Mock provider player</body></html>' });
            return route.abort();
        });
        await page.addInitScript(() => {
            window.pauseCalls = 0;
            const pause = HTMLMediaElement.prototype.pause;
            HTMLMediaElement.prototype.pause = function() { window.pauseCalls++; return pause.call(this); };
        });
        const close = async () => { await page.locator('.lightbox-close').click(); await page.waitForSelector('.pb-image-lightbox', {state:'detached'}); };
        const assertVideo = async () => {
            await page.waitForSelector('.fbks-lightbox-video');
            assert.equal(await page.locator('.lightbox-zoom').count(), 0);
            assert.equal(await page.locator('.fbks-lightbox-video').getAttribute('src').then(url => new URL(url).hostname), 'www.youtube.com');
        };
        await page.goto(base + '/standalone');
        await page.waitForTimeout(150);
        // Icon targeting does not open the video from the image itself.
        await page.locator('.pb-image-block-lightbox').first().click();
        assert.equal(await page.locator('.pb-image-lightbox').count(), 0);
        await page.locator('.fbks-video-lightbox-trigger.pb-image-block-link-icon').first().click();
        await assertVideo();
        if (process.env.FBKS_TEST_SCREENSHOT) await page.screenshot({path:process.env.FBKS_TEST_SCREENSHOT});
        for (const viewport of [{width:1920,height:1080},{width:375,height:812}]) {
            await page.setViewportSize(viewport);
            const boxes = await page.evaluate(() => {
                const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return {left:r.left,width:r.width}; };
                return {inner:rect('.lightbox-inner'),video:rect('.fbks-lightbox-video'),caption:rect('.lightbox-caption')};
            });
            assert(Math.abs(boxes.video.width-boxes.inner.width)<2, 'Video fills available width');
            assert(Math.abs(boxes.video.left-boxes.inner.left)<2, 'Video aligned with inner container');
            assert(Math.abs(boxes.caption.width-boxes.inner.width)<2, 'Caption fills available width');
            assert(Math.abs(boxes.caption.left-boxes.inner.left)<2, 'Caption aligned with video');
        }
        await page.setViewportSize({width:1280,height:720});
        const videoHandle = await page.locator('.fbks-lightbox-video').elementHandle();
        await page.locator('.lightbox-next').click();
        assert.equal(await videoHandle.evaluate(el => el.getAttribute('src')), null);
        assert.equal(await page.locator('.fbks-lightbox-video').count(), 0);
        assert.equal(await page.locator('.lightbox-zoom').count(), 1);
        await page.locator('.lightbox-image img').click();
        assert(await page.locator('.pb-image-lightbox').evaluate(el => el.classList.contains('is-chrome-hidden')));
        await page.keyboard.press('ArrowLeft'); await assertVideo();
        assert(!(await page.locator('.pb-image-lightbox').evaluate(el => el.classList.contains('is-chrome-hidden'))));
        await close();
        await page.locator('.fbks-video-overlay-play').first().click({force:true});
        await assertVideo(); await close();
        for (const gallery of galleries) {
            await page.goto(base + '/' + gallery);
            await page.waitForTimeout(250);
            const selector = gallery === 'filmstrip' ? '.fbks-filmstrip-video-play' : '.fbks-video-lightbox-trigger.pb-image-block-link-icon';
            await page.locator(selector).filter({visible:true}).first().click();
            await assertVideo();
            assert.equal(await page.locator('.lightbox-counter').textContent(), '1 / 2');
            await page.locator('.lightbox-next').click();
            assert.equal(await page.locator('.fbks-lightbox-video').count(), 0);
            assert.equal(await page.locator('.lightbox-zoom').count(), 1, gallery + ': image zoom restored');
            await page.locator('.lightbox-prev').click(); await assertVideo(); await close();
        }
        for (const style of ['blur-overlay','fade-overlay','gradient-bottom','chip','chip-gradient','color-overlay','gradient-overlay']) {
            await page.goto(base + '/overlay-' + style); await page.waitForTimeout(100);
            await page.locator('figure.pb-image-block').hover();
            const play = page.locator('.fbks-video-overlay-play');
            assert.equal(await play.count(),1,style);
            assert.equal((await play.textContent()).trim(),'',style + ': only the play glyph');
            await play.click(); await assertVideo(); await close();
        }
        await page.goto(base + '/native'); await page.waitForTimeout(150);
        await page.locator('.pb-image-block-lightbox').click();
        await page.waitForSelector('video.fbks-lightbox-video');
        const native = await page.locator('video.fbks-lightbox-video').elementHandle();
        assert(await native.evaluate(el => el.controls && el.autoplay && el.playsInline));
        await page.waitForFunction(() => { const video = document.querySelector('video.fbks-lightbox-video'); return video && video.readyState >= 2 && !video.paused && video.currentTime > 0; });
        await native.evaluate(el => el.dispatchEvent(new MouseEvent('click', {bubbles:true})));
        assert.equal(await page.locator('.pb-image-lightbox').count(), 1);
        await close();
        assert.equal(await native.evaluate(el => el.getAttribute('src')), null);
        assert((await page.evaluate(() => window.pauseCalls)) > 0);
        for (const fixture of ['missing','unsafe']) { await page.goto(base + '/' + fixture); assert.equal(await page.locator('[data-video-src], .fbks-video-lightbox-trigger').count(),0); }
        assert.deepEqual(errors, []);
        console.log('Passed: image/video navigation, Icon and overlay targets, six gallery inheritance/overrides, counter, image zoom restoration, native video and cleanup, invalid URL handling. Provider network mocked.');
    } finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
