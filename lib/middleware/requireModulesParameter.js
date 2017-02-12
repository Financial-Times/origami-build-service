'use strict';

const httpError = require('http-errors');

module.exports = function () {
	return (request, response, next) => {
		if (isValidParameter(request.query.modules)) {
			next();
		} else {
			next(
				httpError(400, 'The modules parameter is required and must be a comma-separated list of modules')
			);
		}
	};
};

function isValidParameter(source) {
	return (typeof source === 'string' && source !== '');
}
