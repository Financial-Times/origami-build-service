'use strict';

const getFromArchive = require('../../middleware/archive');

module.exports = app => {
	app.get(
		[
			/^\/v2\/bundles\/(css|js)/,
			/^\/__origami\/service\/build\/v2\/bundles\/(css|js)/,

			'/v2/demos/:fullModuleName/:demoName',
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName',

			'/v2/demos/:fullModuleName/:demoName/html',
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName/html',
			
			/^\/v2\/files\/[^/]+\//,
			/^\/__origami\/service\/build\/v2\/files\/[^/]+\//,
		],
		getFromArchive(app),
	);
};