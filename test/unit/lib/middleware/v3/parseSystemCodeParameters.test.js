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
		try {
			await parseSystemCodeParameter();
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter must be a string.');
		}
	});

	it('throws UserError if system_code parameter is not a string', async () => {
		try {
			await parseSystemCodeParameter(1);
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter must be a string.');
		}
		try {
			await parseSystemCodeParameter(true);
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter must be a string.');
		}

		try {
			await parseSystemCodeParameter([]);
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter must be a string.');
		}
	});

	it('throws UserError if system_code parameter is empty string', async () => {
		try {
			await parseSystemCodeParameter('');
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter can not be empty.');
		}
	});

	it('throws UserError if system_code parameter is not a valid value', async () => {
		try {
			await parseSystemCodeParameter('$$origami!');
			proclaim.notOk('Expected to throw an error but no error was thrown');
		} catch (error) {
			error instanceof UserError;
			proclaim.deepStrictEqual(error.message, 'The system_code query parameter must be a valid Biz-Ops System Code.');
		}
	});

	it('returns the system_code value if it is a valid system-code', async () => {
		proclaim.deepStrictEqual(await parseSystemCodeParameter('origami'), 'origami');
	});
});
