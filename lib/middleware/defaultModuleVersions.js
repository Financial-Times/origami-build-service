'use strict';

const defaultModuleVersions = require('../data/default-module-versions.json');
const parseModulesParameter = require('../utils/parseModulesParameter');

module.exports = function () {

	/**
	 * Middleware used to set a default version for modules which request no version, "*", or "latest".
	 */
	return (request, response, next) => {

		// Used by demo endpoints
		if (request.params.fullModuleName) {
			request.params.fullModuleName = sanitizeModules(request.params.fullModuleName);
		}

		// Used by bundle endpoints
		if (request.query.modules) {
			request.query.modules = sanitizeModules(request.query.modules);
		}
		next();
	};

	function sanitizeModules(value) {
		return parseModulesParameter(value)
			.map(([name, version]) => {

				// If the version resolves to "latest"...
				if (!version || version === '*' || version.toLowerCase() === 'latest') {
					// If a default module version is present for this module, use it.
					// Otherwise we're happy with this module being "latest"
					version = defaultModuleVersions[name] || version;
				}

				return `${name}@${version}`;
			})
			.join(',');
	}

};
