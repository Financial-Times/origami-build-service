'use strict';

function promiseMap(array, asyncMap) {
	return Promise.all(array.map(asyncMap));
}


/**
 * Filter an array using a function that returns a promise as it's predicate.
 *
 * @params array          {Array}    Array to filter
 * @params asyncFilter {Function}    A filter function that returns a promise
 *
 * @returns {Promise}  Returns a promise that contains the entire filtered
 * array.
 */
function promiseFilter(array, asyncFilter) {
	return promiseMap(array, asyncFilter).then(function(result) {
		const accumulator = [];

		for (let index = 0; index < array.length; index++) {
			if (result[index]) {
				accumulator.push(array[index]);
			}
		}
		return accumulator;
	});
}

module.exports.map = promiseMap;
module.exports.filter = promiseFilter;
