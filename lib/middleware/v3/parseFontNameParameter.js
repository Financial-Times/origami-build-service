'use strict';

const UserError = require('../../utils/usererror');
const validFilename = require('valid-filename');

/**
 *
 * @param {string} [fontName] The name of the font to be returned.
 * @throws {import('../../utils/usererror')}
 * @returns {string|undefined}} The name of the font to be returned.
 */
const parseFontNameParameter = fontName => {
	if (fontName === undefined) {
		throw new UserError('The font_name query parameter must be a string.');
	}

	if (typeof fontName !== 'string') {
		throw new UserError('The font_name query parameter must be a string.');
	}

	if (fontName.length === 0) {
		throw new UserError('The font_name query parameter can not be an empty string.');
	}

	if (validFilename(fontName)) {
		return fontName;
	} else {
		throw new UserError(
			'The font_name query parameter value is not valid. It can not contain `/`, `<`, `>`, `:`, `"`, `\\`, `|`, `?`, `*`, or non-printable characters `\\x00-\\x1F`.'
		);
	}
};

module.exports = {
    parseFontNameParameter
};
