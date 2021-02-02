/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseBrandParameter,
} = require('../../../../../lib/middleware/v3/parseBrandParameter');

describe('parseBrandParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseBrandParameter);
	});

	it('throws UserError if brand parameter is undefined', async () => {
		proclaim.throws(() => {
			parseBrandParameter();
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter();
		}, 'The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.');
	});

	it('throws UserError if brand parameter is not a string', async () => {
		proclaim.throws(() => {
			parseBrandParameter(1);
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter(1);
		}, 'The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.');

		proclaim.throws(() => {
			parseBrandParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter(true);
		}, 'The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.');

		proclaim.throws(() => {
			parseBrandParameter([]);
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter([]);
		}, 'The brand query parameter must be a string. Either `master`, `internal`, or `whitelabel`.');
	});

	it('throws UserError if brand parameter is empty string', async () => {
		proclaim.throws(() => {
			parseBrandParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter('');
		}, 'The brand query parameter can not be empty. It must be set to either `master`, `internal`, or `whitelabel`.');
	});

	it('throws UserError if brand parameter is not a valid value', async () => {
		proclaim.throws(() => {
			parseBrandParameter('origami');
		}, UserError);

		proclaim.throws(() => {
			parseBrandParameter('origami');
		}, 'The brand query parameter must be either `master`, `internal`, or `whitelabel`.');
	});
});
