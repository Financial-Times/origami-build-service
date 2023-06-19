/**
 * Determines if a font is deprecated.
 * @param {string} fontFileName The name of the font file to check
 * @returns {boolean} true if the font is deprecated, false otherwise
 */
const isFontDeprecated = (fontFileName) => {
	const deprecatedFonts = ['MillerDisplay', 'BentonSans']

	return !!deprecatedFonts.find((deprecatedFont) => {
		return fontFileName.includes(deprecatedFont);
	});
}

module.exports = isFontDeprecated;