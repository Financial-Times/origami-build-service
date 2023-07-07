const isFontDeprecated = require("../../../../lib/utils/isFontDeprecated");
const assert = require('chai').assert;

describe('isFontDeprecated', () => {
	['MillerDisplay-Black', 'BentonSans-Bold', 'MillerDisplay-Regular'].forEach((font) => {
		describe(`given a deprecated font: ${font}`, () => {
			it('should return true', () => {
				const result = isFontDeprecated(font);

				assert.isTrue(result);
			});
		});
	});

	['MetricWeb', 'FinancierDisplayWeb'].forEach((font) => {
		describe(`given a supported font:  ${font}`, () => {
			it('should return false', () => {
				const result = isFontDeprecated(font);

				assert.isFalse(result);
			});
		});
	});

	['MillerDisplay_Givemeallyourpasswords', 'BentonSans_Hackyhack'].forEach((font) => {
		describe(`given a font which partially matches a deprecated font:  ${font}`, () => {
			it('should return false', () => {
				const result = isFontDeprecated(font);

				assert.isFalse(result);
			});
		});
	});
});

