'use strict';

const outputFont = require('../../middleware/v3/outputFont').outputFont;

module.exports = app => {
	app.get([
		'/__origami/service/build/v3/font',
	],
	outputFont
	);
};
