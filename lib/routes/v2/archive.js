'use strict';

const getFromArchive = require('../../middleware/archive');

module.exports = app => {
	app.get(
		[
			/^\/__origami\/service\/build\/v2\/files\/[^/]+\//,
		],
		(req, res) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-files');
		},
		getFromArchive(app),
	);

	app.get(
		[
			/^\/__origami\/service\/build\/v2\/bundles\/css/,
		],
		(req, res) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-css');
		},
		getFromArchive(app),
	);

	app.get(
		[
			/^\/__origami\/service\/build\/v2\/bundles\/js/,
		],
		(req, res) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-js');
		},
		getFromArchive(app),
	);

	app.get(
		[
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName',
			'/__origami/service/build/v2/demos/:fullModuleName/:demoName/html',
		],
		(req, res) => {
			res.header('Surrogate-Key', 'origami-build-service-v2-demos');
		},
		getFromArchive(app),
	);
};
