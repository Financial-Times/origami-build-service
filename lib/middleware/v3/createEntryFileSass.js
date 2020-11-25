'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const {camelCase} = require('lodash');

/**
 * @param {string} installationDirectory The directory to create the sass file within
 * @param {Object<string, string>} modules The modules to import within the sass file
 * @param {string} brand The value to use for the o-brand sass variable
 * @param {string} systemCode The value to use for the system-code sass variable
 * @returns {Promise<string>} The path on the file system which contains the newly built sass file
 */
async function createEntryFileSass(installationDirectory, modules, brand, systemCode) {
	const entryFileLocation = path.join(installationDirectory, '/index.scss');

	const moduleNames = Array.from(Object.keys(modules)).sort();

	let entryFileContents = '$o-brand: "' + brand + '";\n$system-code: "' + systemCode +'";\n';

	for (const name of moduleNames) {
		const importModule = `@import "${name}";`;
		let include = '';
		if (name.startsWith('@financial-times/o-')) {
			const includeName = camelCase(name.substring('@financial-times/'.length));
			include = `@include ${includeName}();`;
		}

		entryFileContents = entryFileContents + '\n' + importModule + '\n' + include;
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileSass,
};
