import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..", "..");
export const textDomain = "folioblocks";
export const preservedSourceStrings = new Set([
	"Background Video Block",
	"Before & After Block",
	"Carousel Gallery",
	"Carousel Gallery Block",
	"Filmstrip Gallery",
	"Filmstrip Gallery Block",
	"Grid Gallery",
	"Grid Gallery Block",
	"Image Block",
	"Justified Gallery",
	"Justified Gallery Block",
	"Loupe Block",
	"Masonry Gallery",
	"Masonry Gallery Block",
	"Modular Gallery",
	"Modular Gallery Block",
	"Modular Gallery Block (Pro Only)",
	"Proofing Gallery Block",
	"Video Block",
	"Video Gallery",
	"Video Gallery Block",
	"Latest News From FolioBlocks Website:",
	"Changelog:",
	"View Full Changelog",
]);

const sourceDirectories = ["folioblocks.php", "includes", "src"];

const ignoredDirectories = new Set([
	".git",
	"build",
	"languages",
	"node_modules",
	"scripts",
	"vendor",
]);

const translationCallPattern =
	/(?<![\w$])(?:__|_e|esc_html__|esc_attr__|esc_html_e|esc_attr_e)\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])folioblocks\3\s*,?\s*\)/g;

function escapePoString(value) {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\t/g, "\\t")
		.replace(/\r/g, "\\r")
		.replace(/\n/g, "\\n");
}

function unescapeQuotedString(value) {
	return value.replace(/\\([\\'"nrt])/g, (_, character) =>
		({ n: "\n", r: "\r", t: "\t" }[character] ?? character),
	);
}

function getLineNumber(text, index) {
	return text.slice(0, index).split("\n").length;
}

function addMessage(store, msgid, reference) {
	if (!msgid) {
		return;
	}

	if (!store.has(msgid)) {
		store.set(msgid, new Set());
	}

	store.get(msgid).add(reference);
}

function walkDirectory(absoluteDirectory, collectedFiles) {
	for (const entry of fs.readdirSync(absoluteDirectory, {
		withFileTypes: true,
	})) {
		if (entry.isDirectory()) {
			if (!ignoredDirectories.has(entry.name)) {
				walkDirectory(path.join(absoluteDirectory, entry.name), collectedFiles);
			}
			continue;
		}

		if (
			entry.name.endsWith(".php") ||
			entry.name.endsWith(".js") ||
			entry.name === "block.json"
		) {
			collectedFiles.push(path.join(absoluteDirectory, entry.name));
		}
	}
}

function listSourceFiles() {
	const files = [];

	for (const sourcePath of sourceDirectories) {
		const absolutePath = path.join(projectRoot, sourcePath);

		if (!fs.existsSync(absolutePath)) {
			continue;
		}

		if (fs.statSync(absolutePath).isDirectory()) {
			walkDirectory(absolutePath, files);
			continue;
		}

		files.push(absolutePath);
	}

	return files.sort();
}

export function extractMessagesFromCode(relativePath, content, messages) {
	// Plural calls have two literals before the count and text domain.
	const pluralPattern = /(?<![\w$])_n\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*?)\3\s*,\s*[^,]+,\s*(['"])folioblocks\5\s*,?\s*\)/g;
	for (const match of content.matchAll(pluralPattern)) {
		const msgid = unescapeQuotedString(match[2]);
		addMessage(messages, msgid, `${relativePath}:${getLineNumber(content, match.index)}`);
		messages.get(msgid).plural = unescapeQuotedString(match[4]);
	}
	for (const match of content.matchAll(translationCallPattern)) {
		const msgid = unescapeQuotedString(match[2]);
		const line = getLineNumber(content, match.index ?? 0);
		addMessage(messages, msgid, `${relativePath}:${line}`);
	}
}

function extractMessagesFromBlockJson(relativePath, content, messages) {
	let data;

	try {
		data = JSON.parse(content);
	} catch (error) {
		throw new Error(`Unable to parse ${relativePath}: ${error.message}`);
	}

	const lineMap = new Map();
	const valuePattern = /"((?:\\.|[^"])*)"/g;

	for (const match of content.matchAll(valuePattern)) {
		const value = unescapeQuotedString(match[1]);
		if (!lineMap.has(value)) {
			lineMap.set(value, getLineNumber(content, match.index ?? 0));
		}
	}

	const visit = (node) => {
		if (Array.isArray(node)) {
			node.forEach(visit);
			return;
		}

		if (!node || typeof node !== "object") {
			return;
		}

		for (const [key, value] of Object.entries(node)) {
			if (
				typeof value === "string" &&
				new Set(["title", "description", "label", "placeholder"]).has(key)
			) {
				addMessage(
					messages,
					value,
					`${relativePath}:${lineMap.get(value) ?? 1}`,
				);
				continue;
			}

			if (key === "keywords" && Array.isArray(value)) {
				for (const keyword of value) {
					if (typeof keyword === "string") {
						addMessage(
							messages,
							keyword,
							`${relativePath}:${lineMap.get(keyword) ?? 1}`,
						);
					}
				}
				continue;
			}

			visit(value);
		}
	};

	visit(data);
}

export function collectMessages() {
	const messages = new Map();

	for (const absoluteFile of listSourceFiles()) {
		const relativePath = path
			.relative(projectRoot, absoluteFile)
			.replaceAll(path.sep, "/");
		const content = fs.readFileSync(absoluteFile, "utf8");

		if (path.basename(absoluteFile) === "block.json") {
			extractMessagesFromBlockJson(relativePath, content, messages);
		} else {
			extractMessagesFromCode(relativePath, content, messages);
		}
	}

	return new Map(
		Array.from(messages.entries()).sort(([left], [right]) =>
			left.localeCompare(right),
		),
	);
}

function formatPoString(keyword, value) {
	if (!value.includes("\n")) {
		return `${keyword} "${escapePoString(value)}"`;
	}

	const lines = value.split("\n");

	return [
		`${keyword} ""`,
		...lines.map((line, index) => {
			const suffix = index === lines.length - 1 ? "" : "\n";
			return `"${escapePoString(line + suffix)}"`;
		}),
	].join("\n");
}

export function buildPot(
	messages,
	{ language = "", locale = "", translations = {} } = {},
) {
	const packageJsonPath = path.join(projectRoot, "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	const now = new Date()
		.toISOString()
		.replace("T", " ")
		.replace(/\.\d+Z$/, "+0000");
	const headerLines = [
		`Project-Id-Version: FolioBlocks ${packageJson.version}\\n`,
		"Report-Msgid-Bugs-To: https://folioblocks.com\\n",
		`POT-Creation-Date: ${now}\\n`,
		`PO-Revision-Date: ${language ? now : "YEAR-MO-DA HO:MI+ZONE"}\\n`,
		"Last-Translator: \\n",
		"Language-Team: \\n",
		`Language: ${language}\\n`,
		"MIME-Version: 1.0\\n",
		"Content-Type: text/plain; charset=UTF-8\\n",
		"Content-Transfer-Encoding: 8bit\\n",
		`Plural-Forms: ${getPluralForms(language)}\\n`,
		"X-Generator: FolioBlocks custom i18n tooling\\n",
		"X-Domain: folioblocks\\n",
	];

	const chunks = [
		'msgid ""',
		'msgstr ""',
		...headerLines.map((line) => `"${line}"`),
		"",
	];

	for (const [msgid, references] of messages.entries()) {
		chunks.push(`#: ${Array.from(references).join(" ")}`);
		if (/%(?:\d+\$)?[sdif]/.test(msgid)) {
			chunks.push("#, php-format");
		}
		chunks.push(formatPoString("msgid", msgid));
		const translation = translations[msgid];
		if (references.plural) {
			chunks.push(formatPoString("msgid_plural", references.plural));
			for (let index = 0; index < 2; index += 1) {
				chunks.push(formatPoString(`msgstr[${index}]`, translation?.[index] ?? ""));
			}
		} else {
			chunks.push(formatPoString("msgstr", translation ?? ""));
		}
		chunks.push("");
	}

	return chunks.join("\n");
}

export function loadLocaleMap(locale) {
	const localePath = path.join(
		projectRoot,
		"scripts",
		"i18n",
		"locales",
		`${locale}.json`,
	);

	if (!fs.existsSync(localePath)) {
		throw new Error(`Locale map not found: ${localePath}`);
	}

	return JSON.parse(fs.readFileSync(localePath, "utf8"));
}

export function pruneLocaleMap(locale) {
	const localePath = path.join(
		projectRoot,
		"scripts",
		"i18n",
		"locales",
		`${locale}.json`,
	);
	const localeMap = loadLocaleMap(locale);
	const activeMessages = new Set(collectMessages().keys());
	const translations = localeMap.translations ?? {};
	const filteredTranslations = {};
	let removedCount = 0;

	for (const [msgid, translation] of Object.entries(translations)) {
		if (!activeMessages.has(msgid)) {
			removedCount += 1;
			continue;
		}

		filteredTranslations[msgid] = translation;
	}

	if (removedCount > 0) {
		writeFile(
			localePath,
			`${JSON.stringify(
				{ ...localeMap, translations: filteredTranslations },
				null,
				2,
			)}\n`,
		);
	}

	return removedCount;
}

export function getPluralForms(locale) {
	return locale === "fr_FR"
		? "nplurals=2; plural=(n > 1);"
		: "nplurals=2; plural=(n != 1);";
}

function parsePoMultilineBlock(lines, index, keyword) {
	const prefix = `${keyword} `;
	if (!lines[index]?.startsWith(prefix)) {
		throw new Error(`Invalid PO ${keyword} declaration: ${lines[index]}`);
	}
	let value = JSON.parse(lines[index].slice(prefix.length));
	let cursor = index + 1;
	while (cursor < lines.length && lines[cursor].startsWith('"')) {
		value += JSON.parse(lines[cursor]);
		cursor += 1;
	}
	return { value, nextIndex: cursor };
}

export function parsePoFile(poPath) {
	const lines = fs.readFileSync(poPath, "utf8").split(/\r?\n/);
	const translations = new Map();
	const headers = {};
	let cursor = 0;
	while (cursor < lines.length) {
		if (!lines[cursor].startsWith("msgid ")) {
			cursor += 1;
			continue;
		}
		const msgid = parsePoMultilineBlock(lines, cursor, "msgid");
		cursor = msgid.nextIndex;
		let translation;
		if (lines[cursor]?.startsWith("msgid_plural ")) {
			cursor = parsePoMultilineBlock(lines, cursor, "msgid_plural").nextIndex;
			translation = [];
			while (lines[cursor]?.startsWith("msgstr[")) {
				const index = Number(lines[cursor].match(/^msgstr\[(\d+)\]/)[1]);
				const block = parsePoMultilineBlock(lines, cursor, `msgstr[${index}]`);
				translation[index] = block.value;
				cursor = block.nextIndex;
			}
		} else {
			const block = parsePoMultilineBlock(lines, cursor, "msgstr");
			translation = block.value;
			cursor = block.nextIndex;
		}
		if (msgid.value === "") {
			for (const headerLine of translation.split("\n")) {
				const separator = headerLine.indexOf(":");
				if (separator !== -1) {
					headers[headerLine.slice(0, separator).trim()] = headerLine.slice(separator + 1).trim();
				}
			}
		} else {
			translations.set(msgid.value, translation);
		}
	}
	return { headers, translations };
}

export function ensureDirectory(directoryPath) {
	fs.mkdirSync(directoryPath, { recursive: true });
}

export function listBlockScriptHandles() {
	const buildRoot = path.join(projectRoot, "build");
	const handles = [];
	const fieldMappings = {
		editorScript: "editor-script",
		script: "script",
		viewScript: "view-script",
	};

	if (!fs.existsSync(buildRoot)) {
		return handles;
	}

	for (const entry of fs.readdirSync(buildRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			continue;
		}

		const blockJsonPath = path.join(buildRoot, entry.name, "block.json");
		if (!fs.existsSync(blockJsonPath)) {
			continue;
		}

		const metadata = JSON.parse(fs.readFileSync(blockJsonPath, "utf8"));
		const blockName = metadata.name;

		if (!blockName) {
			continue;
		}

		for (const [fieldName, suffix] of Object.entries(fieldMappings)) {
			if (!metadata[fieldName]) {
				continue;
			}

			const assets = Array.isArray(metadata[fieldName])
				? metadata[fieldName]
				: [metadata[fieldName]];

			assets.forEach((asset, index) => {
				if (typeof asset !== "string" || !asset.startsWith("file:")) {
					return;
				}

				let handle = `${blockName.replace("/", "-")}-${suffix}`;
				if (index > 0) {
					handle += `-${index + 1}`;
				}

				handles.push(handle);
			});
		}
	}

	return Array.from(new Set(handles)).sort();
}

export function listBlockScriptAssets() {
	const buildRoot = path.join(projectRoot, "build");
	const assets = [];
	const fieldMappings = {
		editorScript: "editor-script",
		script: "script",
		viewScript: "view-script",
	};

	if (!fs.existsSync(buildRoot)) {
		return assets;
	}

	for (const entry of fs.readdirSync(buildRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			continue;
		}

		const blockDirectory = path.join(buildRoot, entry.name);
		const blockJsonPath = path.join(blockDirectory, "block.json");

		if (!fs.existsSync(blockJsonPath)) {
			continue;
		}

		const metadata = JSON.parse(fs.readFileSync(blockJsonPath, "utf8"));
		const blockName = metadata.name;

		if (!blockName) {
			continue;
		}

		for (const [fieldName, suffix] of Object.entries(fieldMappings)) {
			if (!metadata[fieldName]) {
				continue;
			}

			const entriesForField = Array.isArray(metadata[fieldName])
				? metadata[fieldName]
				: [metadata[fieldName]];

			entriesForField.forEach((asset, index) => {
				if (typeof asset !== "string" || !asset.startsWith("file:")) {
					return;
				}

				let handle = `${blockName.replace("/", "-")}-${suffix}`;
				if (index > 0) {
					handle += `-${index + 1}`;
				}

				assets.push({
					handle,
					filePath: path.join(blockDirectory, asset.replace(/^file:\.\//, "")),
				});
			});
		}
	}

	return assets.sort((left, right) => left.handle.localeCompare(right.handle));
}

// Standalone editor scripts also need the shared catalog, even when none of
// their messages appear in a compiled block bundle.
export function listTranslationScriptAssets() {
	return [
		...listBlockScriptAssets(),
		{
			handle: "folioblocks-page-media-settings",
			filePath: path.join(projectRoot, "includes/pro/js/page-media-settings.js"),
		},
	];
}

export function extractMessagesFromBuiltScript(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error(`Missing translation script: ${filePath}. Run npm run build first.`);
	}

	const content = fs.readFileSync(filePath, "utf8");
	const messages = new Set();
	// Webpack emits both direct calls and calls such as (0,module.__)(...).
	const patterns = [
		/\b__\s*\)?\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])folioblocks\3/g,
		/\b_n\s*\)?\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*?)\3\s*,\s*[^,]+,\s*(['"])folioblocks\5/g,
	];

	for (const pattern of patterns) {
		for (const match of content.matchAll(pattern)) {
			messages.add(unescapeQuotedString(match[2]));
		}
	}
	return messages;
}

export function writeFile(filePath, content) {
	ensureDirectory(path.dirname(filePath));
	fs.writeFileSync(filePath, content, "utf8");
}

// Catalog dates describe content changes, not the last release-check run.
export function writeCatalog(filePath, content) {
	const withoutDates = (value) => value
		.replace(/^"(?:POT-Creation-Date|PO-Revision-Date): .*"$/gm, '')
		.replace(/^  "translation-revision-date": .*$/gm, '');
	if (fs.existsSync(filePath)) {
		const existing = fs.readFileSync(filePath, "utf8");
		if (withoutDates(existing) === withoutDates(content)) {
			return;
		}
	}
	writeFile(filePath, content);
}
