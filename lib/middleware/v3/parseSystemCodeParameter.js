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
 * @returns {string} The system-code
 */
function parseSystemCodeParameter(systemCode) {
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
 * Confirm whether a system-code exists within Biz-Ops.
 *
 * @param {string} code The system-code to check exists in Biz-Ops.
 * @returns {boolean} Returns true if the system-code exists in Biz-Ops and otherwise returns false.
 */
function isValidSystemCode(code) {
	// This regex came from Biz-Ops' validation for system-codes
	// -- https://github.com/Financial-Times/biz-ops-schema/blob/b0a57b94959bd6136607ff664d4800f3907431b8/schema/string-patterns.yaml#L3
	if (/^(?=.{2,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code)) {
		// TODO: Integrate with Biz-Ops via the NodeJS API Client -- https://github.com/Financial-Times/biz-ops-client
		return true;
	} else {
		return false;
	}
}
