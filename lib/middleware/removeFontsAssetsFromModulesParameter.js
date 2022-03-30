'use strict';

const parseModulesParameter = require('../utils/parseModulesParameter');

module.exports = function () {

	/**
	* Middleware used to remove o-fonts-assets. This should not be required directly
	* by JS or CSS bundles and can cause an error when Github auth fails.
	* https://github.com/Financial-Times/origami-build-service/blob/e61068dd6b0dfa2a6159fb988a4578f9df0b549b/index.js#L35
	*/
	return (request, response, next) => {

		// Used by demo endpoints
		if (request.params.fullModuleName) {
			request.params.fullModuleName = removeFontsAssets(request.params.fullModuleName);
		}

		// Used by bundle endpoints
		if (request.query.modules) {
			request.query.modules = removeFontsAssets(request.query.modules);
		}
		next();
	};

	function removeFontsAssets(value) {
		return parseModulesParameter(value)
			.filter(([name]) => name !== 'o-fonts-assets')
			.map(([name, version]) => {
				return `${name}@${version}`;
			})
			.join(',');
	}

};
