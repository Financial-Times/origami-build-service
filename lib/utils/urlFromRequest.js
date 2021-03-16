'use strict';

const querystring = require('querystring');
const path = require('path');

module.exports = {
	urlFromRequest: function urlFromRequest(req) {
		const qs = querystring.stringify(req.query);
		return path.join(req.basePath, req.path) + (qs ? '?' + qs : '');
	}
};
