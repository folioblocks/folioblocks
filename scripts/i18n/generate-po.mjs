import path from 'node:path';
import {
	buildPot,
	collectMessages,
	loadLocaleMap,
	projectRoot,
	writeFile,
} from './shared.mjs';

const locale = process.argv[2];

if (!locale) {
	throw new Error('Usage: node scripts/i18n/generate-po.mjs <locale>');
}

const localeMap = loadLocaleMap(locale);
const translations = { ...(localeMap.translations ?? {}) };

const outputPath = path.join(projectRoot, 'languages', `${'folioblocks'}-${locale}.po`);

writeFile(
	outputPath,
	buildPot(collectMessages(), {
		language: locale,
		locale,
		translations,
	})
);

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
