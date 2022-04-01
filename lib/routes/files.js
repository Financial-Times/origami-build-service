'use strict';

const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app) {
	app.get([
		/^\/files\/[^/]+\//,
		/^\/__origami\/service\/build\/files\/[^/]+\//,
	 ], handleDeprecatedRoute);
};
