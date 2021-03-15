'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Creates a package.json file within `bundleLocation` with the `components` as the dependencies.
 * @param {string} bundleLocation
 * @param {Object<string, string>} components
 * @returns {Promise<void>}
 */
async function createPackageJsonFile(bundleLocation, components) {
	await fs.writeFile(
		path.join(bundleLocation, './package.json'),
		JSON.stringify({
			dependencies: components,
		}, undefined, '\t'),
		'utf-8'
	);
}

module.exports = {
	createPackageJsonFile
};
