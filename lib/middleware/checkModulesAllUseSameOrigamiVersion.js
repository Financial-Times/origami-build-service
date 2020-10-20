'use strict';

const origamiVersion1Modules = require('../data/origami-specification-version-one-module-versions.json');
const parseModulesParameter = require('../utils/parseModulesParameter');
const semver = require('semver');
const httpError = require('http-errors');

/**
 * Find out the Origami Component specification version that the component version was built with.
 *
 * @param {string} name The name of the Origami Component whose Origami Version to return
 * @param {string} version The version of the Origami Component whose Origami Version to return
 * @returns {number} The Origami Version of the component named `name` at version `version`
 */
function getOrigamiVersion(name, version) {
	if (origamiVersion1Modules[name]) {
		// If the version is not a range, it is likely to be a git ref such as a branch name.
		// If the component has a version which was origami spec v1, then we assume the
		// git ref is going to return a version of the component which is origmai spec v1.
		if (!semver.validRange(version)) {
			return 1;
		}
	//TODO: What should we do if the requested version intersects with versions which are spec v1 but is not a full subset?
	// E.G. If component `o-no` versions upto and including v4 are built against origami spec v1 and from v5 onwards is built againt origami spec v2 it's version range which covers spec v1 is `<= 4`. If the version range being requested is `>= 4`, what should we do? This range can return a spec v1 or a spec v2 version and the result is dependent upon whether any other modules in the dependency tree require of `o-no`.
		if (semver.subset(version, origamiVersion1Modules[name])) {
			return 1;
		}
	}

	return 2;
}

/**
 * Find out whether a module is an Origami Component.
 *
 * @param {string} name The name of the module to check
 * @returns {boolean} Whether the module is an Origami Component
 */
function isOrigamiModule(name) {
	return origamiVersion1Modules.hasOwnProperty(name);
}
module.exports = function checkModulesAllUseSameOrigamiVersion() {

	/**
	 * Middleware used to figure out if all module versions being requested are the same origamiVersion.
	 */
	return (request, response, next) => {
		let modules;
		// Used by demo endpoints
		if (request.params.fullModuleName) {
			modules = request.params.fullModuleName;
			// Used by bundle endpoints
		} else if (request.query.modules) {
			modules = request.query.modules;
		}

		if (modules) {
			const parsedModules = parseModulesParameter(modules).filter(([name]) => {
				return isOrigamiModule(name);
			});
			const moduleWithOrigamiVersion = parsedModules.map(([name, version]) => {
				return [getOrigamiVersion(name, version), name, version];
			});

			const allModulesAreOrigamiVersionOne = moduleWithOrigamiVersion.every(([origamiVersion]) => {
				return origamiVersion === 1;
			});

			if (allModulesAreOrigamiVersionOne) {
				return next();
			}

			const allModulesAreOrigamiVersionTwo = moduleWithOrigamiVersion.every(([origamiVersion]) => {
				return origamiVersion === 2;
			});

			if (allModulesAreOrigamiVersionTwo) {
				return next();
			}

			return next(httpError(400,
				'The specific module versions being requested are of different versions of the Origami spec.\n' +
				moduleWithOrigamiVersion.map(([origamiVersion, name, version]) => {
					return `${name}@${version} is Origami version ${origamiVersion}`;
				}).join('\n')
			));
		} else {
			return next();
		}
	};
};
