import fs from 'node:fs';
import path from 'node:path';
import {
	ensureDirectory,
	getPluralForms,
	extractMessagesFromBuiltScript,
	listTranslationScriptAssets,
	parsePoFile,
	projectRoot,
	textDomain,
} from './shared.mjs';

const poPath = process.argv[2];

if (!poPath) {
	throw new Error('Usage: node scripts/i18n/generate-json.mjs <po-file>');
}

const absolutePoPath = path.isAbsolute(poPath)
	? poPath
	: path.join(projectRoot, poPath);

const localeMatch = path.basename(absolutePoPath).match(/-([A-Za-z_]+)\.po$/);
if (!localeMatch) {
	throw new Error(`Unable to determine locale from ${absolutePoPath}`);
}

const locale = localeMatch[1];
const { translations, headers } = parsePoFile(absolutePoPath);
const languageDirectory = path.join(projectRoot, 'languages');
const assets = listTranslationScriptAssets();
if (assets.length < 2) {
	throw new Error('No built blocks found. Run npm run build before generating JSON translations.');
}
// Validate inputs before replacing existing catalogs.
const sharedMessages = new Set();
for (const { filePath } of assets) {
	for (const msgid of extractMessagesFromBuiltScript(filePath)) {
		const translation = translations.get(msgid);
		const forms = Array.isArray(translation) ? translation : [translation];
		if (!forms.length || forms.some((form) => typeof form !== 'string' || !form.trim())) {
			throw new Error(`Missing PO translation for ${JSON.stringify(msgid)}`);
		}
		sharedMessages.add(msgid);
	}
}

ensureDirectory(languageDirectory);

for (const fileName of fs.readdirSync(languageDirectory)) {
	if (
		fileName.startsWith(`${textDomain}-${locale}-`) &&
		fileName.endsWith('.json')
	) {
		fs.unlinkSync(path.join(languageDirectory, fileName));
	}
}

const localeData = {
	'': {
		domain: 'messages',
		lang: locale,
		'plural-forms': headers['Plural-Forms'] || getPluralForms(locale),
	},
};

for (const [msgid, msgstr] of translations.entries()) {
	if (!msgstr) {
		continue;
	}

	localeData[msgid] = Array.isArray(msgstr) ? msgstr : [msgstr];
}

const payload = {
	'translation-revision-date': new Date().toISOString(),
	generator: 'FolioBlocks custom i18n tooling',
	domain: 'messages',
};

const filteredLocaleData = {
	'': localeData[''],
};

for (const msgid of Array.from(sharedMessages).sort()) {
	filteredLocaleData[msgid] = localeData[msgid];
}

if (Object.keys(filteredLocaleData).length > 1) {
	const outputPath = path.join(
		languageDirectory,
		`${textDomain}-${locale}-folioblocks-i18n-loader.json`
	);
	fs.writeFileSync(
		outputPath,
		JSON.stringify(
			{
				...payload,
				locale_data: {
					messages: filteredLocaleData,
				},
			},
			null,
			2
		)
	);
}

console.log(`Generated JSON translations for ${locale}`);
