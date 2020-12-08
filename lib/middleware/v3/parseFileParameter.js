'use strict';

const path = require('path');
const UserError = require('../../utils/usererror');

/**
 *
 * @param {string} [file] The path of the file to be returned.
 * @throws {import('../../utils/usererror')}
 * @returns {string|undefined}} The path of the file to be returned.
 */
const parseFileParameter = file => {
	if (file === undefined) {
		throw new UserError('The file query parameter must be a string.');
	}

	if (typeof file !== 'string') {
		throw new UserError('The file query parameter must be a string.');
	}

	if (file.length === 0) {
		throw new UserError('The file query parameter can not be an empty string.');
	}

	if (isAttemptingToTraverseParentDirectories(file)) {
		throw new UserError(
			'The file query parameter must be a path within the requested component.'
		);
	} else {
		return file;
	}
};

function isAttemptingToTraverseParentDirectories(filePath) {
	const filename = path.join(__dirname, filePath);
	if (!filename.startsWith(__dirname)) {
		return true;
	} else {
		return false;
	}
}

module.exports = {
    parseFileParameter
};
