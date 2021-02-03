'use strict';

const UserError = require('../../utils/usererror');

/**
 *
 * @param {string} [fontFormat] The format of the font to be returned.
 * @throws {import('../../utils/usererror')}
 * @returns {string} The format of the font to be returned.
 */
const parseFontFormatParameter = fontFormat => {
	if (typeof fontFormat !== 'string') {
		throw new UserError('The font_format query parameter must be a string.');
	}

	if (fontFormat.length === 0) {
		throw new UserError('The font_format query parameter can not be an empty string.');
	}

	const supportedFontFormats = ['woff', 'woff2'];
	if (supportedFontFormats.includes(fontFormat)) {
		return fontFormat;
	} else {
		throw new UserError(
			`The font_format query parameter must be one of the supported formats: ${supportedFontFormats.join(' ')}.`
		);
	}
};

module.exports = {
    parseFontFormatParameter
};
