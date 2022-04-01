'use strict';

const outputModuleMetadata = require('../../middleware/outputModuleMetadata');
const cleanBrandParameter = require('../../middleware/cleanBrandParameter');

module.exports = function(app) {

	app.get([
		'/v2/modules/:module',
		'/__origami/service/build/v2/modules/:module',
	],
	cleanBrandParameter(),
	outputModuleMetadata(app));

};
