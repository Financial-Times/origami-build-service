'use strict';

const UserError = require('../../utils/usererror');
const axios = require('axios').default;

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
	if (typeof systemCode !== 'string') {
		throw new UserError('The system_code query parameter must be a string.');
	}

	if (systemCode.length === 0) {
		throw new UserError('The system_code query parameter can not be empty.');
	}

	if (await isValidSystemCode(systemCode)) {
		return systemCode;
	} else {
		throw new UserError('The system_code query parameter must be a valid Biz-Ops System Code.');
	}
};

/**
 * Confirm whether a system-code exists within Biz-Ops.
 *
 * @param {string} code The system-code to check exists in Biz-Ops.
 * @returns {Promise<boolean>} Returns true if the system-code exists in Biz-Ops and otherwise returns false.
 */
async function isValidSystemCode(code) {
	try {
		const response = await axios({
			url: 'https://system-codes.in.ft.com/v1/check',
			method: 'get', // default
			params: {
				systemCode: code
			},
			timeout: 1000 * 10,
			responseType: 'json'
		});

		if (response.status === 200) {
			if (response.data.exists === true) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	} catch (error) {
		// If the request fails for any reason, we assume the code was a valid Biz-Ops system code.
		// This ensures that if the https://system-codes.in.ft.com/ system is offline we can still
		// serve responses to our users.
		return true;
	}
}
