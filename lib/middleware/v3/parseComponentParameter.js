'use strict';

const validateNpmPackageName = require('validate-npm-package-name');
const UserError = require('../../utils/usererror');
const semver = require('semver');

/**
 * Used to ensure the component name and version in the component query parameter conforms to the package.json specification.
 * https://docs.npmjs.com/files/package.json#name
 *
 * If the component name and version are valid, return a Map of component name to version range.
 * If the component name and version are not valid, return an Error HTTP 400 status code, specifying how the component is invalid.
 *
 * @param {string} component A component name and its version range. E.G. `"lodash@^5"`
 * @throws {import('../../utils/usererror')}
 * @returns {Array<string>} An Array where the first entry is the component name and the second entry is the version range
 */
const parseComponentParameter = component => {
	if (typeof component !== 'string') {
		throw new UserError('The component query parameter must be a string.');
	}

	if (component.length === 0) {
		throw new UserError('The component query parameter can not be empty.');
	}

	let componentName;
	if (/^\s/.test(component) || /\s$/.test(component)) {
		throw new UserError(
			`The component query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from \`${component}\` to make the component name valid.`
		);
	}
	if (component.startsWith('@financial-times/')) {
		componentName = '@' + component.split('@')[1];
	} else {
		componentName = component.split('@')[0];
	}

	if (!isValidNpmName(componentName)) {
		throw new UserError(
			`The component query parameter contains component names which are not valid: ${componentName}.`
		);
	}

	if (!(component.lastIndexOf('@') > 0)) {
		throw new UserError(
			`The bundle request contains ${component} with no version range, a version range is required. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).`
		);
	}

	const version = component.substr(component.lastIndexOf('@') + 1);
	if (semver.validRange(version)) {
		return ['@financial-times/'+componentName, version];
	} else {
		throw new UserError(`The version ${version} in ${componentName}@${version} is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).`);
	}
};

/**
 * Checks an npm component name conforms to the package.json specification.
 * @param {String} name An npm component name.
 * @returns {Boolean} Whether the name parameter is valid according to package.json specification.
 */
function isValidNpmName(name) {
	return validateNpmPackageName(name).validForNewPackages;
}

module.exports = {
	parseComponentParameter: parseComponentParameter
};
