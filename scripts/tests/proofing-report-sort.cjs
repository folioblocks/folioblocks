const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const keys = ['heart', 'rating', 'flag', 'comment'];
const records = [
    { id: 'unmarked', heart: 0, rating: 0, flag: 0, comment: 0 },
    { id: 'four', heart: 1, rating: 4, flag: 1, comment: 0 },
    { id: 'five', heart: 0, rating: 5, flag: 0, comment: 1 },
    { id: 'four-tie', heart: 1, rating: 4, flag: 1, comment: 1 },
];
const dom = new JSDOM(`<table class="fbks-proofing-review-table"><thead><tr>${keys.map(key => `<th aria-sort="none"><button data-proofing-sort="${key}">${key}<span class="fbks-proofing-sort__indicator">↕</span></button></th>`).join('')}</tr></thead><tbody>${records.map(row => `<tr id="${row.id}" ${keys.map(key => `data-sort-${key}="${row[key]}"`).join(' ')}><td>${row.id}</td></tr>`).join('')}</tbody></table>`, { runScripts: 'outside-only' });
const { document } = dom.window;
dom.window.eval(fs.readFileSync('includes/pro/js/proofing-sessions.js', 'utf8'));
document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
const order = () => Array.from(document.querySelectorAll('tbody tr'), row => row.id);
const click = key => document.querySelector(`[data-proofing-sort="${key}"]`).click();
click('heart'); assert.deepEqual(order(), ['four', 'four-tie', 'unmarked', 'five']);
click('rating'); assert.deepEqual(order(), ['five', 'four', 'four-tie', 'unmarked']);
assert.equal(document.querySelector('[data-proofing-sort="rating"]').closest('th').getAttribute('aria-sort'), 'descending');
click('rating'); assert.deepEqual(order(), ['unmarked', 'four', 'four-tie', 'five']);
click('flag'); assert.deepEqual(order(), ['four', 'four-tie', 'unmarked', 'five']);
click('comment'); assert.deepEqual(order(), ['five', 'four-tie', 'unmarked', 'four']);
assert.equal(document.querySelectorAll('th[aria-sort="descending"]').length, 1);
assert.equal(document.querySelectorAll('tbody tr').length, 4);
console.log('Passed: feedback-first ordering, highest/lowest ratings, stable ties, direction toggles, ARIA sort state, and retained rows.');
