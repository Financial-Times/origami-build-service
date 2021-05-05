'use strict';

const path = require('path');
const {writeFile, readFile} = require('fs').promises;
const lodash = require('lodash');

async function hasJavaScriptExport (component, directory) {
	const location = path.join(directory, 'node_modules', component, 'package.json');

	const pkg = JSON.parse(await readFile(location, { encoding: 'utf-8'}));
	return Object.prototype.hasOwnProperty.call(pkg, 'browser') || Object.prototype.hasOwnProperty.call(pkg, 'main');
}

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
		const exportsJavaScript = await hasJavaScriptExport(name, installationDirectory);
		if (exportsJavaScript === false) {
			continue;
		}
		const nonNamespaceName = name.replace('@financial-times/', '');
		const camelCasedName = lodash.camelCase(nonNamespaceName);
		const importComponent = `import * as ${camelCasedName} from "${name}";`;
		const addComponentToOrigamiGlobal = `self.Origami["${nonNamespaceName}"] = ${camelCasedName};`;

		if (callback) {
			const addComponentToComponentsVariable = `components["${nonNamespaceName}"] = ${camelCasedName};`;
			entryFileContents = importComponent + '\n' + entryFileContents + '\n' + addComponentToOrigamiGlobal + '\n' + addComponentToComponentsVariable;
		} else {
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
