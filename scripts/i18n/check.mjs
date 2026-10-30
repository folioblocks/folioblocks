import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
	collectMessages,
	extractMessagesFromBuiltScript,
	getPluralForms,
	listTranslationScriptAssets,
	loadLocaleMap,
	parsePoFile,
} from './shared.mjs';

export const locales = ['sv_SE', 'it_IT', 'es_ES', 'fr_FR'];

export function placeholderSignature(value) {
	return [...value.matchAll(/%(?:([1-9]\d*)\$)?[-+0#]*(?:\d+)?(?:\.\d+)?([sdif])/g)]
		.map((match, index) => `${match[1] || index + 1}:${match[2]}`)
		.sort();
}

export function validateTranslations(messages, translations, locale) {
	for (const [msgid, references] of messages) {
		const translation = translations[msgid];
		const forms = references.plural ? translation : [translation];
		assert.ok(Array.isArray(forms) && forms.length === (references.plural ? 2 : 1),
			`${locale}: invalid forms for ${JSON.stringify(msgid)}`);
		for (const form of forms) {
			assert.ok(typeof form === 'string' && form.trim(),
				`${locale}: missing translation for ${JSON.stringify(msgid)}`);
			assert.deepEqual(placeholderSignature(form), placeholderSignature(msgid),
				`${locale}: placeholders differ for ${JSON.stringify(msgid)}`);
		}
	}
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const messages = collectMessages();
	for (const locale of locales) {
		validateTranslations(messages, loadLocaleMap(locale).translations, locale);
	}
	if (!process.argv.includes('--source-only')) {
		const pot = parsePoFile('languages/folioblocks.pot').translations;
		assert.deepEqual([...pot.keys()].sort(), [...messages.keys()].sort(), 'POT is stale');
		const assets = listTranslationScriptAssets();
		assert.ok(assets.length > 1, 'Build blocks before checking catalogs');
		const scriptMessages = new Set(assets.flatMap(({ filePath }) =>
			[...extractMessagesFromBuiltScript(filePath)]));
		const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
		for (const locale of locales) {
			const poPath = `languages/folioblocks-${locale}.po`;
			const { headers, translations } = parsePoFile(poPath);
			assert.equal(headers['Project-Id-Version'], `FolioBlocks ${version}`);
			assert.equal(headers.Language, locale);
			assert.equal(headers['Plural-Forms'], getPluralForms(locale));
			assert.deepEqual([...translations.keys()].sort(), [...messages.keys()].sort());
			const map = loadLocaleMap(locale).translations;
			for (const [msgid, translation] of translations) {
				assert.deepEqual(translation, map[msgid], `${locale}: stale PO ${msgid}`);
			}
			// Checks gettext syntax, format specifiers and required plural forms.
			execFileSync('msgfmt', ['--check', poPath, '-o', '/dev/null'], { stdio: 'inherit' });
			// MO files must be the compiled form of the checked PO, not older builds.
			assert.deepEqual(execFileSync('msgfmt', [poPath, '-o', '-']),
				fs.readFileSync(`languages/folioblocks-${locale}.mo`));
			const data = JSON.parse(fs.readFileSync(
				`languages/folioblocks-${locale}-folioblocks-i18n-loader.json`, 'utf8'
			)).locale_data.messages;
			assert.equal(data[''].lang, locale);
			assert.equal(data['']['plural-forms'], getPluralForms(locale));
			assert.deepEqual(Object.keys(data).filter(Boolean).sort(), [...scriptMessages].sort());
			for (const msgid of scriptMessages) {
				assert.deepEqual(data[msgid], Array.isArray(map[msgid]) ? map[msgid] : [map[msgid]],
					`${locale}: stale JS translation ${msgid}`);
			}
		}
	}
	console.log(`Translation checks passed: ${messages.size} messages in ${locales.length} locales.`);
}
