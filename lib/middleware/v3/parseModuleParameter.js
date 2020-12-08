'use strict';

const validateNpmPackageName = require('validate-npm-package-name');
const UserError = require('../../utils/usererror');
const semver = require('semver');

/**
 * Used to ensure the requested module in the module query parameter conforms to the package.json specification.
 * https://docs.npmjs.com/files/package.json#name
 *
 * If the module name is valid, return a Map of module name to version range.
 * If the module name is not valid, return an Error HTTP 400 status code, specifying that the module name is invalid.
 *
 * @param {string} module The module to validate
 * @throws {import('../../utils/usererror')}
 * @returns {Object<string, string>|{}}} A Map where the key is the module name and the value is the version range
 */
const parseModuleParameter = module => {
	if (module === undefined || module.length === 0) {
		throw new UserError('The module query parameter can not be empty.');
	}

	if (typeof module !== 'string') {
		throw new UserError('The module query parameter must be a string.');
	}

	if (/^\s/.test(module) || /\s$/.test(module)) {
		throw new UserError(
			`The module query parameter contains whitespace either the start or end. Remove the whitespace from "${module}" to make the module name valid.`
		);
	}

	let moduleName;
	if (module.startsWith('@')) {
		moduleName = '@' + module.split('@')[1];
	} else {
		moduleName = module.split('@')[0];
	}

	if (!isValidNpmModuleName(moduleName)) {
		throw new UserError(
			`The module query parameter contains a name which is not valid: ${moduleName}.`
		);
	}

	const dependencies = {};
	if (!(module.lastIndexOf('@') > 0)) {
		throw new UserError(
			`The module query parameter contains ${module} with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.`
		);
	}

	const name = module.substr(0, module.lastIndexOf('@'));
	const version = module.substr(module.lastIndexOf('@') + 1);
	if (semver.validRange(version)) {
		dependencies[name] = version;
	} else {
		throw new UserError(`The version ${version} in ${name}@${version} is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.`);
	}

	return dependencies;
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
