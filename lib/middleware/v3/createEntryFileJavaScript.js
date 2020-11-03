'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const lodash = require('lodash');

/**
 * @param {string} installationDirectory
 * @param {Map<string, string>} modules
 */
async function createEntryFileJavaScript(installationDirectory, modules) {
	const entryFileLocation = path.join(installationDirectory, '/index.js');

	const moduleNames = Array.from(modules.keys()).sort();

	let entryFileContents = 'if (typeof Origami === \'undefined\') { self.Origami = {}; }';

	for (const name of moduleNames) {
			const camelCasedName = lodash.camelCase(name);
			const importModule = `import * as ${camelCasedName} from "${name}";`;
			const addFileToOrigamiGlobal = `self.Origami["${name}"] = ${camelCasedName};`;

			entryFileContents = importModule + '\n' + entryFileContents + '\n' + addFileToOrigamiGlobal;
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileJavaScript,
};
