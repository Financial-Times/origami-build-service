'use strict';

const request = require('request');

module.exports = requestPromise;

function requestPromise(options = {}) {
	const opts = Object.assign({forever: true}, options);

	return new Promise((resolve, reject) => {
		request(opts, (error, response) => {
            if (error) {
                return reject(error);
            }
            resolve(response);
        });
	});
}
