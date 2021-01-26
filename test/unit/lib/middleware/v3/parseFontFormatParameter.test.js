/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseFontFormatParameter,
} = require('../../../../../lib/middleware/v3/parseFontFormatParameter');

describe('parseFontFormatParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseFontFormatParameter);
	});
	it('throws UserError if font_format parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseFontFormatParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter('');
		}, 'The font_format query parameter can not be an empty string.');
	});

	it('throws UserError if font_format parameter is not undefined or a string', async () => {
		proclaim.throws(() => {
			parseFontFormatParameter(null);
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter(null);
		}, 'The font_format query parameter must be a string.');

		proclaim.throws(() => {
			parseFontFormatParameter([1, 2]);
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter([1, 2]);
		}, 'The font_format query parameter must be a string.');

		proclaim.throws(() => {
			parseFontFormatParameter(12);
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter(12);
		}, 'The font_format query parameter must be a string.');

		proclaim.throws(() => {
			parseFontFormatParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter(true);
		}, 'The font_format query parameter must be a string.');
	});

	it('throws UserError if font_format parameter is not a supported format', async () => {
		proclaim.throws(() => {
			parseFontFormatParameter('nonsense');
		}, UserError);

		proclaim.throws(() => {
			parseFontFormatParameter('nonsense');
		}, 'The font_format query parameter must be one of the supported formats: woff woff2.');
	});

	it('returns font_format parameter if it is a valid value', async () => {
		proclaim.deepStrictEqual(parseFontFormatParameter('woff'), 'woff');
		proclaim.deepStrictEqual(parseFontFormatParameter('woff2'), 'woff2');
	});
});
