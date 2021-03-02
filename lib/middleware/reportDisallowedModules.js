'use strict';

const parseModulesParameter = require('../utils/parseModulesParameter');
const allowedModules = require('../data/v2-module-allow-list.json');
const Raven = require('raven');

module.exports = function () {

	/**
     * Middleware used to report any module requested which isn't on an allow list,
     * with the intention of throwing an error when the list is comprehensive
     */
	return (request, response, next) => {

		// Used by bundle endpoints
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
			}
		}
		next();
	};
};