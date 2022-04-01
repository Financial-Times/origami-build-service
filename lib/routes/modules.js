'use strict';

const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app) {
	app.get([
		'/modules/:module',
		'/__origami/service/build/modules/:module',
	 ], handleDeprecatedRoute);
};
