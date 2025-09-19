const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const glob = require('glob');
const path = require('path');

const entries = {};

// Add index.js and view.js for each block
glob.sync('./src/*/index.js').forEach(file => {
	const blockName = path.basename(path.dirname(file));
	entries[`${blockName}/index`] = path.resolve(__dirname, file);
});
glob.sync('./src/*/view.js').forEach(file => {
	const blockName = path.basename(path.dirname(file));
	entries[`${blockName}/view`] = path.resolve(__dirname, file);
});

// Add premium.js from pro/ folder if it exists
glob.sync('./src/*/pro/premium.js').forEach(file => {
	const blockName = path.basename(path.dirname(path.dirname(file)));
	entries[`${blockName}/premium`] = path.resolve(__dirname, file);
});

// Export merged config
module.exports = {
	...defaultConfig,
	entry: entries,
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build'),
	},
};