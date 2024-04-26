'use strict';

const UserError = require('../../utils/usererror');

module.exports = {
	parseSystemCodeParameter: parseSystemCodeParameter
};

/**
 * Used to ensure the system_code parameter is set to a valid value
 *
 * If the system_code value is valid, returns the system_code value.
 * If the system_code value is not valid, returns an HTTP 400 status code.
 *
 * @param {string} systemCode The system-code to compile the css for.
 * @throws {import('../../utils/usererror')}
 * @returns {Promise<string>} The system-code
 */
async function parseSystemCodeParameter(systemCode) {
	// Allow a placeholder system code, that is not a valid system code, for
	// projects which are not in Biz-Ops. E.g. personal projects, tutorials,
	// and prototypes.
	if (systemCode === '$$$-no-bizops-system-code-$$$') {
		return systemCode;
	}

	if (typeof systemCode !== 'string') {
		throw new UserError('The system_code query parameter must be a string.');
	}

	if (systemCode.length === 0) {
		throw new UserError('The system_code query parameter can not be empty.');
	}

	if (isValidSystemCode(systemCode)) {
		return systemCode;
	} else {
		throw new UserError('The system_code query parameter must be a valid Biz-Ops System Code.');
	}
};

/**
 * Confirm whether a system-code matches the format of a Biz-Ops system code.
 *
 * @param {string} code The system-code to check for validity.
 * @returns {boolean} Returns true if the system-code is a valid Biz Ops system-code and otherwise returns false.
 */
function isValidSystemCode(code) {
	// The pattern is taken from Biz-ops-schema which sets the valid system code pattern.
	// https://github.com/Financial-Times/biz-ops-schema/blob/9babf227d2cd10bdae33821a2cd10b55c8e95856/schema/string-patterns.yaml#L3
	return /^(?=.{2,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code);
}
