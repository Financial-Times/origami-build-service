'use strict';

const httpError = require('http-errors');

module.exports = function () {
	/**
	 * Middleware used to enforce the source parameter matches v1.3 of the system code spec.
     * We currently check that the source is a valid system code, not that it exists.
     * @see https://docs.google.com/document/d/1RCwmr7J98oEi1ELoKMLsbZslvPe4VZ6eY_ZLQ4c8Yqc
	 */
    return (request, response, next) => {
        const source = request.query.source;
        if (source && !(typeof source === 'string' && source.match(/^[a-z0-9\-]{3,32}$/))) {
            next(
                httpError(400, 'The "source" parameter must be a valid system code, according to v1.3 of the system code spec.')
            );
        } else {
            // Fallback for the source query parameter until v3 requires it:
            // https://github.com/Financial-Times/origami-build-service/issues/67
            if (!source) {
                request.query.source = 'build-service';
            }
            next();
        }
    };
};
