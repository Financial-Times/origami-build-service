'use strict';

/**
 * Determines if a font is deprecated.
 * @param {string} fontFileName The name of the font file to check
 * @returns {boolean} true if the font is deprecated, false otherwise
 */
const isFontDeprecated = (fontFileName) => {
	const deprecatedFonts = ['BentonSans-Bold',
		'BentonSans-Bold',
		'BentonSans-Light',
		'BentonSans-Light',
		'BentonSans-Medium',
		'BentonSans-Medium',
		'BentonSans-Medium',
		'BentonSans-Regular',
		'BentonSans-Regular',
		'BentonSansBook-Regular',
		'BentonSansBook-Regular',
		'BentonSansBook-Regular',
		'MillerDisplay-Black',
		'MillerDisplay-Black',
		'MillerDisplay-Bold',
		'MillerDisplay-Bold',
		'MillerDisplay-Regular',
		'MillerDisplay-Regular',
		'MillerDisplay-Semibold',
		'MillerDisplay-Semibold',
		'MillerDisplay-Semibold'];

	return !!deprecatedFonts.find((deprecatedFont) => {
		return fontFileName === deprecatedFont;
	});
};

module.exports = isFontDeprecated;
