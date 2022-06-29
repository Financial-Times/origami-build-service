'use strict';

const outputDemo = require('../../middleware/outputDemo');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');
const defaultModuleVersions = require('../../middleware/defaultModuleVersions');
const semver = require('semver');
const parseModulesParameter = require('../../utils/parseModulesParameter');
const UserError = require('../../utils/usererror');
const getFromArchive = require('../../middleware/archive');

const errorForNonSemverModuleVersions = () => {
	return (request, response, next) => {
		const moduleVersionPairs = parseModulesParameter(request.params.fullModuleName);
		const moduleVersionPair = moduleVersionPairs[0];
		const moduleVersion = moduleVersionPair[1] ? moduleVersionPair[1] : null;
		const disallowedModuleVersion = !semver.validRange(moduleVersion) && moduleVersion !== 'latest';
		if (moduleVersion && disallowedModuleVersion) {
			return next(new UserError(
				'Demos may only be built for components at a valid semver ' +
				'version number or their latest release.'
			));
		}
		next();
	};
};


module.exports = app => {
	app.get([
		'/v2/demos/:fullModuleName/:demoName',
		'/__origami/service/build/v2/demos/:fullModuleName/:demoName',
	],
	getFromArchive(app),
	cleanBrandParameter(),
	errorForNonSemverModuleVersions(),
	defaultModuleVersions(),
	outputDemo(app));

	app.get([
		'/v2/demos/:fullModuleName/:demoName/html',
		'/__origami/service/build/v2/demos/:fullModuleName/:demoName/html',
	],
	getFromArchive(app),
	cleanBrandParameter(),
	errorForNonSemverModuleVersions(),
	defaultModuleVersions(),
	outputDemo(app, {
		outputMinimalHtml: true
	}));
};
