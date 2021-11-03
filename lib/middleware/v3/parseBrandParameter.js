'use strict';

const UserError = require('../../utils/usererror');

/**
 * Used to ensure the brand parameter is set to a valid value
 *
 * If the brand value is valid, returns the brand value.
 * If the brand value is not valid, returns an HTTP 400 status code.
 *
 * @param {string} brand The brand to compile the css for. Either "master" (deprecated), "core", "internal", or "whitelabel".
 * @throws {import('../../utils/usererror')}
 * @returns {string} The brand
 */
const parseBrandParameter = brand => {
	if (typeof brand !== 'string') {
		throw new UserError('The brand query parameter must be a string. Either `core`, `internal`, or `whitelabel`. Note the `master` brand has been renamed the `core` brand, the `master` brand is deprecated and used in only old versions of components.');
	}

	if (brand.length === 0) {
		throw new UserError('The brand query parameter can not be empty. It must be set to either `core`, `internal`, or `whitelabel`. Note the `master` brand has been renamed the `core` brand, the `master` brand is deprecated and used in only old versions of components.');
	}

	switch (brand) {
	case 'core': {
		return 'master';
	}
	case 'master':
	case 'internal':
	case 'whitelabel': {
		return brand;
	}
	default: {
		throw new UserError('The brand query parameter must be either `core`, `internal`, or `whitelabel`. Note the `master` brand has been renamed the `core` brand, the `master` brand is deprecated and used in only old versions of components.');
	}
	}
};

module.exports = {
	parseBrandParameter
};
