'use strict';

const httpError = require('http-errors');

module.exports = function () {

	/**
	 * Middleware used to enforce all modules names in the modules query parameter conform to the bower.json specification.
	 * https://github.com/bower/spec/blob/master/json.md#name
	 *
	 * If all modules names are valid according to bower, move on to the next middleware.
	 * If any modules names are not valid, return an HTTP 400 status code, specifying which module names are invalid.
	 */
	return (request, response, next) => {
		if (request.query.modules) {

			/*
				Turns 'o-colors,o-grid@^4,o-techdocs@*,o-buttons@latest'
				into [['o-colors', ''], ['o-grid', '^4'], ['o-techdocs', '*'], ['o-buttons', 'latest']]
			*/
			const moduleVersionPairs = request.query.modules.split(',').map(module => module.split('@'));

			const invalidModuleVersionPairs = moduleVersionPairs.filter(function ([name]) {
				return !isValidBowerModuleName(name);
			});

			if (invalidModuleVersionPairs.length > 0) {
				const invalidModuleVersionsString = invalidModuleVersionPairs.map(([name]) => name).join(', ');

				next(
					httpError(400, `The modules parameter contains module names which are not valid: ${invalidModuleVersionsString}`)
				);

			} else {
				next();
			}
		} else {
			next();
		}
	};
};

/**
 * Checks a Bower module name conforms to the bower.json specification.
 * @param {String} name A Bower module name.
 * @returns {Boolean} Whether the name parameter is valid according to bower.
 */
function isValidBowerModuleName(name = '') {
	return /^[a-z0-9_][a-z0-9_\.\-]*[a-z0-9_]$/.test(name.toLowerCase());
}
