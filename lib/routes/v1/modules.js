'use strict';

const handleDeprecatedRoute = require('../../../deprecated/v1-deprecated');

module.exports = function(app) {
	app.get([
		'/v1/modules/:module',
		'/__origami/service/build/v1/modules/:module',
	 ], handleDeprecatedRoute);
};
