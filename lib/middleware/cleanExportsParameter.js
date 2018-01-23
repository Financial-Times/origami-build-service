'use strict';

const httpError = require('http-errors');

module.exports = function () {

	/**
	 * Middleware used to ensure the exports query parameter only contains underscores, and alphanumeric characters.
	 *
	 * If export parameter is missing, move on to the next middleware.
	 * If export parameter is valid, move on to the next middleware.
	 * If export parameter is not valid, return an HTTP 400 status code.
	 */
	return (request, response, next) => {
		if (request.query.export && !/^[a-zA-Z0-9_\.]+$/.test(request.query.export)) {
			next(
				httpError(400, `The export parameter can only contain underscore, period, and alphanumeric characters. The export parameter given was: ${request.query.export}`)
			);
		} else {
			next();
		}
	};
};