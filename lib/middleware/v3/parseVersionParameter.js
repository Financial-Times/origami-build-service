'use strict';

const UserError = require('../../utils/usererror');
const semver = require('semver');

/**
 * Used to ensure version parameter is a valid Semantic Version string.
 *
 * If the version is valid, return the version.
 * If the version is not valid, return an Error HTTP 400 status code, specifying that the version is invalid.
 *
 * @param {string} version The string to validate
 * @throws {import('../../utils/usererror')}
 * @returns {string} The string passed in to validate
 */
const parseVersionParameter = version => {
	if (version === undefined || version.length === 0) {
		throw new UserError('The version query parameter can not be empty.');
	}

	if (typeof version !== 'string') {
		throw new UserError('The version query parameter must be a string.');
	}

	if (version !== version.trim()) {
		throw new UserError(`The version query parameter cannot have whitespace at the start or end. The provided version was "${version}"`);
	}

	if (! semver.validRange(version)) {
		throw new UserError(`The version ${version} is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/).`);
	}

	return version;

};

module.exports = {
	parseVersionParameter
};
