'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const lodash = require('lodash');

/**
 * @param {string} installationDirectory
 * @param {Object<string, string>} components
 * @param {string} [callback]
 */
async function createEntryFileJavaScript(installationDirectory, components, callback) {
	const entryFileLocation = path.join(installationDirectory, '/index.js');

	const componentNames = Array.from(Object.keys(components)).sort();

	let entryFileContents = '';
	if (callback) {
		entryFileContents += 'let components = {};\n';
	}
	entryFileContents += 'if (typeof Origami === \'undefined\') { self.Origami = {}; }';

	for (const name of componentNames) {
		const camelCasedName = lodash.camelCase(name);
		const importComponent = `import * as ${camelCasedName} from "${name}";`;
		const addComponentToOrigamiGlobal = `self.Origami["${name}"] = ${camelCasedName};`;

		if (callback) {
			const addComponentToComponentsVariable = `components["${name}"] = ${camelCasedName};`;
			entryFileContents = importComponent + '\n' + entryFileContents + '\n' + addComponentToOrigamiGlobal + '\n' + addComponentToComponentsVariable;
		}else {
			entryFileContents = importComponent + '\n' + entryFileContents + '\n' + addComponentToOrigamiGlobal;
		}
	}

	if (callback) {
		entryFileContents += `\ntypeof ${callback} === 'function' && ${callback}(components);`;
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileJavaScript,
};
