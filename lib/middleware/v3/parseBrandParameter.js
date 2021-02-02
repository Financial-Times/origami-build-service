'use strict';

const UserError = require('../../utils/usererror');

/**
 * Used to ensure the brand parameter is set to a valid value
 *
 * If the brand value is valid, returns the brand value.
 * If the brand value is not valid, returns an HTTP 400 status code.
 *
 * @param {string} brand The brand to compile the css for. Either "master", "internal", or "whitelabel".
 * @throws {import('../../utils/usererror')}
 * @returns {string} The brand
 */
const parseBrandParameter = brand => {
	if (typeof brand !== 'string') {
		throw new UserError('The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.');
	}

	if (brand.length === 0) {
		throw new UserError('The brand query parameter can not be empty. It must be set to either `master`, `internal`, or `whitelabel`.');
	}

	switch (brand) {
		case 'master':
		case 'internal':
		case 'whitelabel': {
			return brand;
		}
		default: {
			throw new UserError('The brand query parameter must be either `master`, `internal`, or `whitelabel`.');
		}
	}
};

module.exports = {
    parseBrandParameter
};
