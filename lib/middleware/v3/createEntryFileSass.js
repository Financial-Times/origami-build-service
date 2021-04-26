'use strict';

const path = require('path');
const writeFile = require('fs').promises.writeFile;
const {camelCase} = require('lodash');


function generateSassInclude(componentName) {
	const includeName = camelCase(componentName.substring('@financial-times/'.length));

	return `@if not mixin-exists('${includeName}') {
    @error 'Could not compile sass as ${componentName} does not have a primary mixin. ' +
    'If you think this is an issue, please contact the Origami community on Slack in #origami-support. ' +
    'If you want to learn more about what a primary mixin is, here is a link to the specification -- https://origami.ft.com/spec/v2/components/sass/#primary-mixin';
}
@include ${includeName}();`;
}

/**
 * @param {string} installationDirectory The directory to create the sass file within
 * @param {Object<string, string>} components The components to import within the sass file
 * @param {string} brand The value to use for the o-brand sass variable
 * @param {string} systemCode The value to use for the system-code sass variable
 * @returns {Promise<string>} The path on the file system which contains the newly built sass file
 */
async function createEntryFileSass(installationDirectory, components, brand, systemCode) {
	const entryFileLocation = path.join(installationDirectory, '/index.scss');

	const componentNames = Array.from(Object.keys(components)).sort();

	let entryFileContents = '$o-brand: "' + brand + '";\n$system-code: "' + systemCode +'";\n';

	for (const name of componentNames) {
		const importComponent = `@import "${name}/main";`;
		const include = generateSassInclude(name);
		entryFileContents = entryFileContents + '\n' + importComponent + '\n' + include;
	}

	await writeFile(entryFileLocation, entryFileContents);

	return entryFileLocation;
}

module.exports = {
	createEntryFileSass,
};
