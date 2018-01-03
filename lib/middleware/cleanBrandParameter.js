'use strict';

const httpError = require('http-errors');

module.exports = function () {
	/**
	 * Middleware used to enforce the brand query parameter is alphanumeric.
	 */
    return (request, response, next) => {
        const brand = request.query.brand;
        if (brand && !/^[a-z0-9]+$/i.test(brand)) {
            next(
                httpError(400, `The brand parameter must be alphanumeric only: ${brand}`)
            );
        } else {
            next();
        }
    };
};
