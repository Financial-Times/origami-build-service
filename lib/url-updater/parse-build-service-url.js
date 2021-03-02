'use strict';

const UserError = require('../utils/usererror');

/**
 * @param {*} givenBuildServiceUrl - The Build Service URL To Parse
 * @return {URL} - A URL object representing the given Build Service URL
 * @throws {UserError} - Throws a user error if the provided build service is not valid or expected
 */
module.exports = function parseBuildServiceUrl(givenBuildServiceUrl) {
	// Avoid XSS, error if the Build Service URL contains unexpected characters.
	if (!givenBuildServiceUrl) {
		throw new UserError('Could not parse your Build Service URL, looks like you didn\'t submit one to check yet?');
	}
	if (
		typeof givenBuildServiceUrl !== 'string' ||
        givenBuildServiceUrl.match(/[^\w\s-@^\.\*\,=:/?&\#\%]/) // match anything that is not a word (alphanumeric or underscore), space, dash, or other characters we expect in a Build Service URL
	) {
		throw new UserError('Your Build Service URL could not be read, it contained unexpected characters.');
	}
	if (!givenBuildServiceUrl.includes('/bundles/')) {
		throw new UserError('This tool only supports the Build Service "bundles" endpoint.');
	}
	try {
		return new URL(givenBuildServiceUrl);
	} catch (error) {
		throw new UserError('Your Build Service URL does not appear to be a valid URL.');
	}
};
