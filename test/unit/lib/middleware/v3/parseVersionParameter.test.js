/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseVersionParameter,
} = require('../../../../../lib/middleware/v3/parseVersionParameter');

describe('parseVersionParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseVersionParameter);
	});
	it('throws UserError if version parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseVersionParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseVersionParameter('');
		}, 'The version query parameter can not be empty.');
	});

	it('throws UserError if version parameter is a version name with whitespace at the start', async () => {
		proclaim.throws(() => {
			parseVersionParameter(' 1');
		}, UserError);
		proclaim.throws(() => {
			parseVersionParameter(' 1');
		}, 'The version query parameter cannot have whitespace at the start or end. The provided version was " 1"');
	});

	it('throws UserError if version parameter is a version name with whitespace at the end', async () => {
		proclaim.throws(() => {
			parseVersionParameter('1 ');
		}, UserError);

		proclaim.throws(() => {
			parseVersionParameter('1 ');
		}, 'The version query parameter cannot have whitespace at the start or end. The provided version was "1 "');
	});

	it('throws UserError if version parameter is an invalid version', async () => {
		proclaim.throws(() => {
			parseVersionParameter('5wg');
		}, UserError);

		proclaim.throws(() => {
			parseVersionParameter('5wg');
		}, 'The version 5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseVersionParameter('5wg');
		}, 'The version 5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('returns the provided version if it is a valid version', async () => {
		const version = '100';

		proclaim.deepStrictEqual(
			parseVersionParameter(
				'100'
			),
			version
		);
	});
});
