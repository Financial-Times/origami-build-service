'use strict';

const path = require('path');
const navigation = require('../../data/navigation.json');

module.exports = function () {
	/**
     * Middleware used to add a `navigation` option to the request, with
     * the current navigation item marked
     */
	return (request, response, next) => {
		const requestPath = request.path.split('?')[0];
		for (const item of navigation.items) {
			if (item.href === requestPath || item.href === path.join('/__origami/service/build', requestPath)) {
				item.current = true;
			} else {
				item.current = false;
			}
		}
		request.navigation = navigation;
		next();
	};
};
