'use strict';

const outputModuleMetadata = require('../middleware/outputModuleMetadata');

module.exports = function(app) {
	app.get('/modules/:module', outputModuleMetadata(app));
};
