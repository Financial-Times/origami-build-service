'use strict';

const httpError = require('http-errors');
const parseModulesParameter = require('../utils/parseModulesParameter');
const allowedModules = require('../data/v2-module-allow-list.json');
const Raven = require('raven');

module.exports = function () {

	/**
	 * Middleware used to enforce all modules names in the modules query parameter conform to the bower.json specification.
	 * https://github.com/bower/spec/blob/master/json.md#name
	 *
	 * If all modules names are valid according to bower, and are in the allow list, move on to the next middleware.
	 * If any modules names are not valid, return an HTTP 400 status code, specifying which module names are invalid.
	 */
	return (request, response, next) => {
		if (request.query.modules) {

			const moduleVersionPairs = parseModulesParameter(request.query.modules);

			const invalidModuleVersionPairs = moduleVersionPairs.filter(function ([name]) {
				return !isValidBowerModuleName(name);
			});

			if (invalidModuleVersionPairs.length > 0) {
				const invalidModuleVersionsString = invalidModuleVersionPairs.map(([name]) => name).join(', ');

				return next(
					httpError(400, `The modules parameter contains module names which are not valid: ${invalidModuleVersionsString}`)
				);

			}

			for (const [name, version] of parseModulesParameter(request.query.modules)) {
				if (!allowedModules.includes(name)) {
					Raven.captureMessage('A module was requested via v2 of the Build Service which is not on the allowed list of modules.', {
						level: 'warning',
						tags: {
							disallowed_module: true,
							module: name,
							version
						},
					});

					return next(
						httpError(400, `An unrecognised component, "${name}", was included in the module parameter. An allow list of components has been added for security reasons. Please check for typos or speak to the Origami team for help.`)
					);
				}
			}

		}

		next();
	};
};

/**
 * Checks a Bower module name conforms to the bower.json specification.
 * @param {String} name A Bower module name.
 * @returns {Boolean} Whether the name parameter is valid according to bower.
 */
function isValidBowerModuleName(name = '') {
	return name.length <= 50 && /^(?!.*[.-]{2,})([a-z0-9_][a-z0-9_.-]*[a-z0-9_])$/.test(name.toLowerCase());
}
