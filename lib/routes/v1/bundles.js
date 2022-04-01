'use strict';

const handleDeprecatedBundle = require('../../../deprecated/v1-deprecated-bundle');

module.exports = function(app) {
	app.get([
		/^\/v1\/bundles\/(css|js)/,
		/^\/__origami\/service\/build\/v1\/bundles\/(css|js)/,
	 ], handleDeprecatedBundle);
};
