/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseSystemCodeParameter,
} = require('../../../../../lib/middleware/v3/parseSystemCodeParameter');

describe('parseSystemCodeParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseSystemCodeParameter);
	});

	it('throws UserError if system_code parameter is undefined', async () => {
		proclaim.throws(() => {
			parseSystemCodeParameter();
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter();
		}, 'The system_code query parameter must be a string.');
	});

	it('throws UserError if system_code parameter is not a string', async () => {
		proclaim.throws(() => {
			parseSystemCodeParameter(1);
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter(1);
		}, 'The system_code query parameter must be a string.');

		proclaim.throws(() => {
			parseSystemCodeParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter(true);
		}, 'The system_code query parameter must be a string.');

		proclaim.throws(() => {
			parseSystemCodeParameter([]);
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter([]);
		}, 'The system_code query parameter must be a string.');
	});

	it('throws UserError if system_code parameter is empty string', async () => {
		proclaim.throws(() => {
			parseSystemCodeParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter('');
		}, 'The system_code query parameter can not be empty.');
	});

	it('throws UserError if system_code parameter is not a valid value', async () => {
		proclaim.throws(() => {
			parseSystemCodeParameter('$$origami!');
		}, UserError);

		proclaim.throws(() => {
			parseSystemCodeParameter('$$origami!');
		}, 'The system_code query parameter must be a valid Biz-Ops System Code.');
	});

	it('returns the system_code value if it is a valid system-code', async () => {
		proclaim.deepStrictEqual(parseSystemCodeParameter('origami'), 'origami');
	});
});
