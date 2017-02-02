'use strict';

const createRouteHandler = require('../express/promisehandler');

module.exports = function(app) {
	const buildSystem = app.origami.options.buildSystem;

	app.get(/^\/files\/[^\/]+\//, createRouteHandler(buildSystem.outputFile));

};
