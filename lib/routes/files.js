'use strict';

const handleDeprecatedRoute = require('../../deprecated/v1-deprecated');

module.exports = function(app) {
	app.get(/^\/files\/[^\/]+\//, handleDeprecatedRoute);
};
