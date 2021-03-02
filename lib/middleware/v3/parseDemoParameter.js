'use strict';

const UserError = require('../../utils/usererror');

/**
 * Used to ensure the demo parameter is set to a valid value
 *
 * If the demo value is valid, returns the demo value.
 * If the demo value is not valid, returns an HTTP 400 status code.
 *
 * @param {string} demo The demo to compile the css for. Either "master", "internal", or "whitelabel".
 * @throws {import('../../utils/usererror')}
 * @returns {string} The demo
 */
const parseDemoParameter = demo => {
	if (typeof demo !== 'string') {
		throw new UserError('The demo query parameter must be a string.');
	}

	if (demo.length === 0) {
		throw new UserError('The demo query parameter can not be empty.');
	}

	return demo;
};

module.exports = {
	parseDemoParameter
};
