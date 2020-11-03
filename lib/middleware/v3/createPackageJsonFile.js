'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Creates a package.json file within `bundleLocation` with the `modules` as the dependencies.
 * @param {string} bundleLocation
 * @param {Map<string, string>} modules
 * @returns {Promise<void>}
 */
async function createPackageJsonFile(bundleLocation, modules) {
	await fs.writeFile(
		path.join(bundleLocation, './package.json'),
		JSON.stringify({
			dependencies: modules,
		}),
		'utf-8'
	);
}

module.exports = {
    createPackageJsonFile
};
