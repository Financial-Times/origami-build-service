'use strict';

const httpError = require('http-errors');

module.exports = function () {
	/**
	 * Middleware used to enforce the brand query parameter is alphanumeric.
	 */
    return (request, response, next) => {
        const brand = request.query.brand;
        const acceptedBrands = ['master', 'internal', 'whitelabel'];
        if (brand && !acceptedBrands.includes(brand)) {
            next(
                httpError(400, `The brand parameter must be one of: ${acceptedBrands.join(', ')}.`)
            );
        } else {
            next();
        }
    };
};
