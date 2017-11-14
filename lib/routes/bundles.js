'use strict';

const handleDeprecatedBundle = require('../../deprecated/v1-deprecated-bundle');

module.exports = function(app) {
    app.get(/^\/bundles\/(css|js)/, handleDeprecatedBundle);
};
