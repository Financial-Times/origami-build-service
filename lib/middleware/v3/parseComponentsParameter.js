'use strict';

const validateNpmPackageName = require('validate-npm-package-name');
const UserError = require('../../utils/usererror');
const semver = require('semver');

/**
 * Finds the duplicates in a list and return them in a Set
 * @param {Array<any>} list
 * @returns {Set<any>}
 */
function findDuplcates(list) {
	const seen = new Set();
	const duplicates = new Set();
	for (const item of list) {
		if (seen.has(item)) {
			duplicates.add(item);
		}
		seen.add(item);
	}

	return duplicates;
}

/**
 * Checks whether `str` is an empty string.
 *
 * @param {string} str string to check is empty
 * @returns {boolean} whether the string `str` is empty
 */
function isEmptyString(str) {
	return str === '';
}

/**
 * Used to ensure all component names in the components query parameter conform to the package.json specification.
 * https://docs.npmjs.com/files/package.json#name
 *
 * If all component names are valid, return a Map of component name to version range.
 * If any component names are not valid, return an Error HTTP 400 status code, specifying which component names are invalid.
 *
 * @param {string} components comma-separated list of components and their version range. E.G. `"lodash@^5,preact@^10.5.5"`
 * @throws {import('../../utils/usererror')}
 * @returns {Object<string, string>|{}}} A Map where the key is the component name and the value is the version range
 */
const parseComponentsParameter = components => {
	if (components === undefined || components.length === 0) {
		throw new UserError('The components query parameter can not be empty.');
	}

	if (typeof components !== 'string') {
		throw new UserError('The components query parameter must be a string.');
	}

	const parsedComponents = components.split(',');

	if (parsedComponents.some(isEmptyString)) {
		throw new UserError(
			'The components query parameter can not contain empty component names.'
		);
	}

	const componentNames = parsedComponents.map(mod => {
		if (/^\s/.test(mod) || /\s$/.test(mod)) {
			throw new UserError(
				`The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from \`${mod}\` to make the component name valid.`
			);
		}
		if (mod.startsWith('@')) {
			return '@' + mod.split('@')[1];
		} else {
			return mod.split('@')[0];
		}
	});

	const invalidComponentNames = componentNames.filter(
		name => !isValidNpmName(name)
	);

	if (invalidComponentNames.length > 0) {
		throw new UserError(
			`The components query parameter contains component names which are not valid: ${invalidComponentNames.join(
				', '
			)}.`
		);
	}

	const duplicates = findDuplcates(componentNames);
	if (duplicates.size) {
		throw new UserError(
			`The components query parameter contains duplicate component names. Please remove one of the follow from the components parameter: ${Array.from(duplicates).join(', ')}`
		);
	}

	const dependencies = {};
	for (const component of parsedComponents) {
		if (!(component.lastIndexOf('@') > 0)) {
			throw new UserError(
				`The bundle request contains ${component} with no version range, a version range is required. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).`
			);
		}

		const [name, version] = component.split('@');
		if (semver.validRange(version)) {
			dependencies['@financial-times/'+name] = version;
		} else {
			throw new UserError(`The version ${version} in ${name}@${version} is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).`);
		}
	}

	return dependencies;
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
	parseComponentsParameter
};
