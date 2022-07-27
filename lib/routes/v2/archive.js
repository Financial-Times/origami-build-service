'use strict';

const getFromArchive = require('../../middleware/archive');

module.exports = app => {
	app.get(
		[
			/^\/__origami\/service\/build\/v2\/files\/[^/]+\//,
		],
		(req, res, next) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-files');
			next();
		},
		getFromArchive(app),
	);

	app.get(
		[
			/^\/__origami\/service\/build\/v2\/bundles\/css/,
		],
		(req, res, next) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-css');
			next();
		},
		getFromArchive(app),
	);

	app.get(
		[
			/^\/__origami\/service\/build\/v2\/bundles\/js/,
		],
		(req, res, next) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-js');
			next();
		},
		getFromArchive(app),
	);

	app.get(
		[
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName',
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName/html',
		],
		(req, res, next) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-demos');
			next();
		},
		getFromArchive(app),
	);
};
