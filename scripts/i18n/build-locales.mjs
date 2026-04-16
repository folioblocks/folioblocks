import { execFileSync } from "node:child_process";
import path from "node:path";
import { projectRoot, pruneLocaleMap } from "./shared.mjs";

const locales = process.argv.slice(2);

if (locales.length === 0) {
	throw new Error(
		"Usage: node scripts/i18n/build-locales.mjs <locale> [locale...]",
	);
}

for (const locale of locales) {
	const poFile = path.join(
		projectRoot,
		"languages",
		`folioblocks-${locale}.po`,
	);
	const moFile = path.join(
		projectRoot,
		"languages",
		`folioblocks-${locale}.mo`,
	);

	const removedCount = pruneLocaleMap(locale);
	if (removedCount > 0) {
		console.log(`Pruned ${removedCount} stale translation keys from ${locale}`);
	}

	execFileSync(process.execPath, ["scripts/i18n/generate-po.mjs", locale], {
		cwd: projectRoot,
		stdio: "inherit",
	});

	execFileSync("msgfmt", [poFile, "-o", moFile], {
		cwd: projectRoot,
		stdio: "inherit",
	});

	execFileSync(process.execPath, ["scripts/i18n/generate-json.mjs", poFile], {
		cwd: projectRoot,
		stdio: "inherit",
	});
}
