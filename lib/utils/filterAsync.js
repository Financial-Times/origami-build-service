'use strict';

const Q = require('q');

/**
 * Filter an array using a function that returns a promise as it's predicate.
 *
 * @params array          {Array}    Array to filter
 * @params asyncFilter {Function}    A filter function that returns a promise
 *
 * @returns {Promise}  Returns a promise that contains the entire filtered
 * array.
 */
module.exports = Q.async(function* (array, asyncFilter) {
    const results = [];
    for (const item of array) {
        if (yield asyncFilter(item)) {
            results.push(item);
        }
    }
    return results;
});
