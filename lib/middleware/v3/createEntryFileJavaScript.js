'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const lodash = require('lodash');

/**
 * @param {string} installationDirectory
 * @param {Object<string, string>} modules
 * @param {string} [callback]
 */
async function createEntryFileJavaScript(installationDirectory, modules, callback) {
	const entryFileLocation = path.join(installationDirectory, '/index.js');

	const moduleNames = Array.from(Object.keys(modules)).sort();

	let entryFileContents = '';
	if (callback) {
		entryFileContents += 'let modules = {};\n';
	}
	entryFileContents += 'if (typeof Origami === \'undefined\') { self.Origami = {}; }';

	for (const name of moduleNames) {
			const camelCasedName = lodash.camelCase(name);
			const importModule = `import * as ${camelCasedName} from "${name}";`;
			const addModuleToOrigamiGlobal = `self.Origami["${name}"] = ${camelCasedName};`;

			if (callback) {
				const addModuleToModulesVariable = `modules["${name}"] = ${camelCasedName};`;
				entryFileContents = importModule + '\n' + entryFileContents + '\n' + addModuleToOrigamiGlobal + '\n' + addModuleToModulesVariable;
			}else {
				entryFileContents = importModule + '\n' + entryFileContents + '\n' + addModuleToOrigamiGlobal;
			}
	}

	if (callback) {
		entryFileContents += `\ntypeof ${callback} === 'function' && ${callback}(modules);`;
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileJavaScript,
};
