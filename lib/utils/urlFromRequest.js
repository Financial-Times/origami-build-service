'use strict';

const querystring = require('querystring');
const path = require('path');

module.exports = {
	urlFromRequest: function urlFromRequest(req) {
		const qs = querystring.stringify(req.query);
		if (req.path.startsWith('/__origami/service/build/')) {
			return req.path + (qs ? '?' + qs : '');
		} else {
			return path.join('/__origami/service/build/', req.path) + (qs ? '?' + qs : '');
		}
	}
};
