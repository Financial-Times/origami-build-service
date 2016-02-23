'use strict';

module.exports = function createRouteHandler(handler) {

	return function(req, res, next) {
		const handlerPromise = handler(req, res);

		if ('catch' in handlerPromise) {
			handlerPromise.catch(function(err) {
				next(err);
			});
		}

		return handlerPromise;
	};

};
