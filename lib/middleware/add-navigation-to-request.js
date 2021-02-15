'use strict';

const navigation = require('../../data/navigation.json');

module.exports = function () {
    /**
     * Middleware used to add a `navigation` option to the request, with
     * the current navigation item marked
     */
    return (request, response, next) => {
        const path = request.path.split('?')[0];
        navigation.items.map(item => item.current = false);
        const item = navigation.items.find(item => {
            return path === '/' + item.href;
        });
        if (item) {
            item.current = true;
        }
        request.navigation = navigation;
        next();
    };
};
