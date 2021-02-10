'use strict';

const outputDemo = require('../../middleware/outputDemo');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');
const defaultModuleVersions = require('../../middleware/defaultModuleVersions');
const semver = require('semver');
const parseModulesParameter = require('../../utils/parseModulesParameter');
const UserError = require('../../utils/usererror');

const errorForNonSemverModuleVersions = () => {
	return (request, response, next) => {
		const moduleVersionPairs = parseModulesParameter(request.params.fullModuleName);
		if (!moduleVersionPairs[0] || !semver.validRange(moduleVersionPairs[0][1])) {
			return next(new UserError('Demos may only be built for components which have been released with a valid semver version number.'));
		}
		next();
	};
};


module.exports = app => {
	app.get('/v2/demos/:fullModuleName/:demoName',
		cleanBrandParameter(),
		errorForNonSemverModuleVersions(),
		defaultModuleVersions(),
		outputDemo(app));

	app.get('/v2/demos/:fullModuleName/:demoName/html',
		cleanBrandParameter(),
		errorForNonSemverModuleVersions(),
		defaultModuleVersions(),
		outputDemo(app, {
			outputMinimalHtml: true
		}));
};
