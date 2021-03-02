'use strict';

const UserError = require('../../utils/usererror');

/**
 *
 * @param {string} [callback] The name of the function to call when the bundle has finished executing.
 * @throws {import('../../utils/usererror')}
 * @returns {string|undefined}} The name of the function or undefined if not function name was supplied.
 */
const parseCallbackParameter = callback => {
	if (callback === undefined) {
		return undefined;
	}

	if (typeof callback !== 'string') {
		throw new UserError('The callback query parameter must be a string or not set at all.');
	}

	if (callback.length === 0) {
		throw new UserError('The callback query parameter can not be an empty string. If you want to not supply a callback then you need to remove the callback query paramter.');
	}

	if (/^[\w.]+$/.test(callback)) {
		return callback;
	} else {
		throw new UserError(
			'The callback query parameter must be a valid name for a JavaScript variable or function.'
		);
	}
};

module.exports = {
	parseCallbackParameter
};
