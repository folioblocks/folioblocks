import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import {
	buildPot,
	collectMessages,
	extractMessagesFromBuiltScript,
	extractMessagesFromCode,
	getPluralForms,
	loadLocaleMap,
	parsePoFile,
	writeCatalog,
} from './shared.mjs';
import { locales, validateTranslations } from './check.mjs';

function temporaryFile(t, content) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'folioblocks-i18n-'));
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const file = path.join(directory, 'fixture');
	fs.writeFileSync(file, content);
	return file;
}

test('extracts trailing-comma calls, plurals and escaped literals without other domains', () => {
	const messages = new Map();
	extractMessagesFromCode('fixture.php', String.raw`
		__('Save', 'folioblocks',);
		_n('%d star', '%d stars', $rating, 'folioblocks');
		__('Quote: \' and literal \\n', 'folioblocks');
		__('Other', 'another-domain');
	`, messages);
	assert.deepEqual([...messages.keys()].sort(), ['%d star', "Quote: ' and literal \\n", 'Save']);
	assert.equal(messages.get('%d star').plural, '%d stars');
	assert.deepEqual([...messages.get('%d star')], ['fixture.php:3']);
});

test('PO round-trip preserves headers, newlines, backslashes, quotes and plural forms', (t) => {
	const msgid = 'First line\nSecond "line" \\n';
	const references = new Set(['fixture.php:1']);
	const plurals = new Set(['fixture.php:2']);
	plurals.plural = '%d stars';
	const translations = { [msgid]: 'Première ligne\nDeuxième "ligne" \\n', '%d star': ['%d étoile', '%d étoiles'] };
	const po = buildPot(new Map([[msgid, references], ['%d star', plurals]]), {
		language: 'fr_FR', translations,
	});
	const file = temporaryFile(t, po);
	const parsed = parsePoFile(file);
	assert.equal(parsed.headers.Language, 'fr_FR');
	assert.equal(parsed.headers['Plural-Forms'], 'nplurals=2; plural=(n > 1);');
	assert.deepEqual(Object.fromEntries(parsed.translations), translations);
	// Independent gettext compiler verifies the format and plural declarations.
	execFileSync('msgfmt', ['--check', file, '-o', '/dev/null']);
});

test('PO parser joins wrapped non-empty lines as well as empty declarations', (t) => {
	const file = temporaryFile(t, 'msgid "Long "\n"message"\nmsgstr "Långt "\n"meddelande"\n');
	assert.equal(parsePoFile(file).translations.get('Long message'), 'Långt meddelande');
});

test('finds singular and plural messages in direct and webpack-wrapped calls', (t) => {
	const file = temporaryFile(t, `
		(0,a.__)("First", "folioblocks");
		wp.i18n.__("Second", "folioblocks");
		(0,a._n)("%d star", "%d stars", n, "folioblocks");
		__("Third", "folioblocks",);
	`);
	assert.deepEqual([...extractMessagesFromBuiltScript(file)].sort(), ['%d star', 'First', 'Second', 'Third']);
	assert.throws(() => extractMessagesFromBuiltScript(`${file}.missing`), /Missing translation script/);
});

test('coverage validation rejects missing, malformed and placeholder-damaged translations', () => {
	const references = new Set(['fixture:1']);
	const messages = new Map([['Image %1$d: %2$s', references]]);
	assert.throws(() => validateTranslations(messages, {}, 'sv_SE'), /missing translation/);
	assert.throws(() => validateTranslations(messages, { 'Image %1$d: %2$s': 'Bild %s' }, 'sv_SE'), /placeholders differ/);
	assert.doesNotThrow(() => validateTranslations(messages, { 'Image %1$d: %2$s': '%2$s: Bild %1$d' }, 'sv_SE'));
	const plurals = new Set(['fixture:2']);
	plurals.plural = '%d stars';
	const pluralMessages = new Map([['%d star', plurals]]);
	assert.throws(() => validateTranslations(pluralMessages, { '%d star': 'star' }, 'sv_SE'), /invalid forms/);
	assert.throws(() => validateTranslations(pluralMessages, { '%d star': ['%d stjärna', ''] }, 'sv_SE'), /missing translation/);
});

test('all supported locales cover every current source message with valid placeholders', () => {
	const messages = collectMessages();
	assert.equal(messages.get('%d star').plural, '%d stars');
	for (const locale of locales) {
		validateTranslations(messages, loadLocaleMap(locale).translations, locale);
	}
	assert.equal(getPluralForms('fr_FR'), 'nplurals=2; plural=(n > 1);');
	assert.equal(getPluralForms('sv_SE'), 'nplurals=2; plural=(n != 1);');
});


test('catalog regeneration preserves dates until catalog content changes', (t) => {
	for (const [before, after] of [
		['"POT-Creation-Date: old"\n"PO-Revision-Date: old"\nmsgstr "Save"',
		 '"POT-Creation-Date: new"\n"PO-Revision-Date: new"\nmsgstr "Save"'],
		['{\n  "translation-revision-date": "old",\n  "message": "Save"\n}',
		 '{\n  "translation-revision-date": "new",\n  "message": "Save"\n}'],
	]) {
		const file = temporaryFile(t, before);
		writeCatalog(file, after);
		assert.equal(fs.readFileSync(file, 'utf8'), before);
		const changed = after.replace('Save', 'Saved');
		writeCatalog(file, changed);
		assert.equal(fs.readFileSync(file, 'utf8'), changed);
	}
});
