import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const pluginSlug = 'folioblocks';
const zipPath = path.join(root, `${ pluginSlug }.zip`);
const phpCandidates = [
	process.env.PHP_BINARY,
	'/Applications/MAMP/bin/php/php8.3.14/bin/php',
	'php',
].filter(Boolean);

const log = (message) => {
	console.log(`\n==> ${ message }`);
};

const fail = (message) => {
	console.error(`\nRelease check failed: ${ message }`);
	process.exit(1);
};

const run = (command, args, options = {}) => {
	const result = spawnSync(command, args, {
		cwd: root,
		stdio: 'inherit',
		shell: false,
		...options,
	});

	if (result.status !== 0) {
		fail(`Command failed: ${ [ command, ...args ].join(' ') }`);
	}
};

const getOutput = (command, args, options = {}) =>
	execFileSync(command, args, {
		cwd: root,
		encoding: 'utf8',
		...options,
	});

const findPhp = () => {
	for (const candidate of phpCandidates) {
		const result = spawnSync(candidate, [ '-v' ], {
			cwd: root,
			stdio: 'ignore',
			shell: false,
		});

		if (result.status === 0) {
			return candidate;
		}
	}

	fail('Could not find a PHP binary for syntax checks.');
};

const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

const getPluginVersion = () => {
	const pluginFile = readFileSync(path.join(root, 'folioblocks.php'), 'utf8');
	const headerVersion = pluginFile.match(/^\s*\*\s*Version:\s*([^\s]+)/m)?.[1];
	const constantVersion = pluginFile.match(/define\(\s*'FBKS_VERSION'\s*,\s*'([^']+)'\s*\)/)?.[1];

	return { headerVersion, constantVersion };
};

const getReadmeStableTag = () => {
	const readme = readFileSync(path.join(root, 'readme.txt'), 'utf8');
	return readme.match(/^Stable tag:\s*([^\s]+)/m)?.[1];
};

const requireFile = (file, base = root) => {
	const fullPath = path.join(base, file);

	if (! existsSync(fullPath) || ! statSync(fullPath).isFile()) {
		fail(`Missing required file: ${ file }`);
	}
};

const requireDirectoryAbsent = (dir, base = root) => {
	const fullPath = path.join(base, dir);

	if (existsSync(fullPath)) {
		fail(`Unexpected directory found: ${ dir }`);
	}
};

const listFiles = (dir, predicate = () => true) => {
	const output = getOutput('find', [ dir, '-type', 'f' ]);
	return output
		.split('\n')
		.filter(Boolean)
		.filter(predicate);
};

const lintPhpFiles = (php, base) => {
	const phpFiles = listFiles(base, (file) => file.endsWith('.php'));

	for (const file of phpFiles) {
		const result = spawnSync(php, [ '-l', file ], {
			cwd: root,
			stdio: 'pipe',
			encoding: 'utf8',
			shell: false,
		});

		if (result.status !== 0) {
			console.error(result.stdout);
			console.error(result.stderr);
			fail(`PHP syntax check failed: ${ path.relative(root, file) }`);
		}
	}
};

const assertRenderFilesMatch = () => {
	const renderFiles = listFiles(path.join(root, 'src'), (file) =>
		file.endsWith('/render.php')
	);

	for (const srcFile of renderFiles) {
		const relative = path.relative(path.join(root, 'src'), srcFile);
		const buildFile = path.join(root, 'build', relative);

		requireFile(path.join('build', relative));

		const result = spawnSync('cmp', [ '-s', srcFile, buildFile ], {
			cwd: root,
			stdio: 'ignore',
			shell: false,
		});

		if (result.status !== 0) {
			fail(`Generated render file differs from source: build/${ relative }`);
		}
	}
};

const assertVersionsMatch = () => {
	const packageJson = readJson('package.json');
	const packageLock = readJson('package-lock.json');
	const { headerVersion, constantVersion } = getPluginVersion();
	const stableTag = getReadmeStableTag();
	const versions = {
		'package.json': packageJson.version,
		'package-lock.json': packageLock.version,
		'package-lock root package': packageLock.packages?.['']?.version,
		'plugin header': headerVersion,
		FBKS_VERSION: constantVersion,
		'readme stable tag': stableTag,
	};
	const uniqueVersions = new Set(Object.values(versions));

	for (const [ label, version ] of Object.entries(versions)) {
		if (! version) {
			fail(`Could not read version from ${ label }.`);
		}
	}

	if (uniqueVersions.size !== 1) {
		console.error(versions);
		fail('Release versions do not match.');
	}

	return packageJson.version;
};

const assertRequiredProjectFiles = () => {
	[
		'folioblocks.php',
		'readme.txt',
		'changelog.md',
		'package.json',
		'package-lock.json',
		'build/pb-image-block/render.php',
		'includes/php/filter-helpers.php',
		'includes/php/css-values.php',
		'includes/php/i18n.php',
	].forEach((file) => requireFile(file));
};

const assertBranchSpecificPackageRules = (version, packageRoot) => {
	if (/^1\.4\./.test(version)) {
		requireDirectoryAbsent('build/proofing-gallery-block', packageRoot);
		requireFile('includes/php/css-values.php', packageRoot);

		if (existsSync(path.join(packageRoot, 'includes/php/proofing-gallery.php'))) {
			fail('1.4.x package unexpectedly includes includes/php/proofing-gallery.php.');
		}
	}
};

const assertZipContents = (version) => {
	if (! existsSync(zipPath)) {
		fail(`Expected zip was not created: ${ path.basename(zipPath) }`);
	}

	const tempDir = mkdtempSync(path.join(tmpdir(), 'folioblocks-release-'));

	try {
		run('unzip', [ '-q', zipPath, '-d', tempDir ]);

		const packageRoot = path.join(tempDir, pluginSlug);
		if (! existsSync(packageRoot)) {
			fail(`Zip does not contain expected ${ pluginSlug}/ root directory.`);
		}

		[
			'folioblocks.php',
			'readme.txt',
			'changelog.md',
			'build/pb-image-block/render.php',
			'includes/php/css-values.php',
		].forEach((file) => requireFile(file, packageRoot));

		lintPhpFiles(php, packageRoot);
		assertBranchSpecificPackageRules(version, packageRoot);

		const zipPluginFile = readFileSync(path.join(packageRoot, 'folioblocks.php'), 'utf8');
		if (! zipPluginFile.includes(`Version:           ${ version }`)) {
			fail('Zip plugin header version does not match package.json.');
		}
	} finally {
		rmSync(tempDir, { recursive: true, force: true });
	}
};

const php = findPhp();

log('Removing generated build artifacts');
rmSync(path.join(root, 'build'), { recursive: true, force: true });
rmSync(zipPath, { force: true });

log('Building from the current source branch');
run('npm', [ 'run', 'build' ]);

log('Checking required files and version consistency');
assertRequiredProjectFiles();
const version = assertVersionsMatch();

log('Checking copied PHP render files');
assertRenderFilesMatch();

log('Linting project PHP files');
[
	'folioblocks.php',
	'includes',
	'src',
	'build',
].forEach((target) => lintPhpFiles(php, path.join(root, target)));

log('Creating plugin zip');
run('npm', [ 'run', 'plugin-zip' ]);

log('Auditing zip contents');
assertZipContents(version);

console.log(`\nRelease package check passed for FolioBlocks ${ version }.`);
