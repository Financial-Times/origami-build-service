'use strict';

const parseModulesParameter = require('../utils/parseModulesParameter');
const allowedShrinkwrapModules = require('../data/v2-shrinkwrap-module-allow-list.json');
const httpError = require('http-errors');

module.exports = function () {

	/**
	 * Middleware used to enforce that all modules requested through the
	 * shrinkwrap parameter are on the allow list. The allow list was generated
	 * by logging current requests and the dependencies are previously released
	 * components.
	 */
	return (request, response, next) => {
		if(request.query.shrinkwrap) {
			for (const [name] of parseModulesParameter(request.query.shrinkwrap)) {
				if (!allowedShrinkwrapModules.includes(name)) {
					return next(
						httpError(400, `An unrecognised module, "${name}", was included in the shrinkwrap parameter. An allow list of modules has been added for security reasons. Please speak to the Origami team for help.`)
					);
				}
			}

		}

		next();
	};
};
