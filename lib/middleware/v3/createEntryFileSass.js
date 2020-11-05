'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const {camelCase} = require('lodash');
/**
 * @param {string} installationDirectory
 * @param {Object<string, string>} modules
 */
async function createEntryFileSass(installationDirectory, modules) {
	const entryFileLocation = path.join(installationDirectory, '/index.scss');

	const moduleNames = Array.from(Object.keys(modules)).sort();

	let entryFileContents = '$o-brand: "internal";\n$system-code: "origami-polyfill-service";\n';

	for (const name of moduleNames) {
		const importModule = `@import "${name}";`;
		let include = '';
		if (name.startsWith('@financial-times/o-')) {
			const includeName = camelCase(name.substring('@financial-times/'.length));
			include = `@include ${includeName}();`;
		}

		entryFileContents = entryFileContents + '\n' + importModule + '\n' + include + '\n';
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileSass,
};
