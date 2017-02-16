'use strict';


const outputModuleMetadata = require('../../middleware/outputModuleMetadata');

module.exports = function(app) {

	app.get('/v2/modules/:module', outputModuleMetadata(app.origami.options));

};
