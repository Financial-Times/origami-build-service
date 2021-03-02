'use strict';

const validateNpmPackageName = require('validate-npm-package-name');
const UserError = require('../../utils/usererror');
const semver = require('semver');

/**
 * Used to ensure the module name and version in the module query parameter conforms to the package.json specification.
 * https://docs.npmjs.com/files/package.json#name
 *
 * If the module name and version are valid, return a Map of module name to version range.
 * If the module name and version are not valid, return an Error HTTP 400 status code, specifying how the module is invalid.
 *
 * @param {string} mod A module name and its version range. E.G. `"lodash@^5"`
 * @throws {import('../../utils/usererror')}
 * @returns {Array<string>} An Array where the first entry is the module name and the second entry is the version range
 */
const parseModuleParameter = mod => {
	if (typeof mod !== 'string') {
		throw new UserError('The module query parameter must be a string.');
	}

	if (mod.length === 0) {
		throw new UserError('The module query parameter can not be empty.');
	}

	let moduleName;
	if (/^\s/.test(mod) || /\s$/.test(mod)) {
		throw new UserError(
			`The module query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from \`${mod}\` to make the module name valid.`
		);
	}
	if (mod.startsWith('@financial-times/')) {
		moduleName = '@' + mod.split('@')[1];
	} else {
		moduleName = mod.split('@')[0];
	}

	if (!moduleName.startsWith('@financial-times/')) {
		throw new UserError(
			`The module query parameter can only contain modules from the @financial-times namespace. The module being requested was: ${moduleName}.`
		);
	}

	if (!isValidNpmModuleName(moduleName)) {
		throw new UserError(
			`The module query parameter contains module names which are not valid: ${moduleName}.`
		);
	}

	if (!(mod.lastIndexOf('@') > 0)) {
		throw new UserError(
			`The bundle request contains ${mod} with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.`
		);
	}

	const name = mod.substr(0, mod.lastIndexOf('@'));
	const version = mod.substr(mod.lastIndexOf('@') + 1);
	if (semver.validRange(version)) {
		return [name, version];
	} else {
		throw new UserError(`The version ${version} in ${name}@${version} is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.`);
	}

};

/**
 * Checks an npm module name conforms to the package.json specification.
 * @param {String} name An npm module name.
 * @returns {Boolean} Whether the name parameter is valid according to package.json specification.
 */
function isValidNpmModuleName(name) {
	return validateNpmPackageName(name).validForNewPackages;
}

module.exports = {
	parseModuleParameter
};
