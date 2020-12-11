/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseModuleParameter,
} = require('../../../../../lib/middleware/v3/parseModuleParameter');

describe('parseModuleParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseModuleParameter);
	});
	it('throws UserError if module parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseModuleParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter('');
		}, 'The module query parameter can not be empty.');
	});

	it('throws UserError if module parameter is a module name with whitespace at the start', async () => {
		proclaim.throws(() => {
			parseModuleParameter(' o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter(' @ft/o-test@1');
		}, 'The module query parameter contains whitespace either the start or end. Remove the whitespace from " @ft/o-test@1" to make the module name valid.');
	});

	it('throws UserError if module parameter is a module name with whitespace at the end', async () => {
		proclaim.throws(() => {
			parseModuleParameter('o-test@1 ');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter('o-test@1 ');
		}, 'The module query parameter contains whitespace either the start or end. Remove the whitespace from "o-test@1 " to make the module name valid.');

		proclaim.throws(() => {
			parseModuleParameter('@ft/o-test@1 ');
		}, 'The module query parameter contains whitespace either the start or end. Remove the whitespace from "@ft/o-test@1 " to make the module name valid.');
	});

	it('throws UserError if module parameter is a module name without a version', async () => {
		proclaim.throws(() => {
			parseModuleParameter('o-test');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter('o-test');
		}, 'The module query parameter contains o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseModuleParameter('@ft/o-test');
		}, 'The module query parameter contains @ft/o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if module parameter is a module name with an invalid version', async () => {
		proclaim.throws(() => {
			parseModuleParameter('o-test@5wg');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter('o-test@5wg');
		}, 'The version 5wg in o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseModuleParameter('@ft/o-test@5wg');
		}, 'The version 5wg in @ft/o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if module parameter contains an invalid module name', async () => {
		proclaim.throws(() => {
			parseModuleParameter('o-TeSt@5');
		}, UserError);

		proclaim.throws(() => {
			parseModuleParameter('o-TeSt@5');
		}, 'The module query parameter contains a name which is not valid: o-TeSt.');

		proclaim.throws(() => {
			parseModuleParameter('@ft/o-TeSt@5');
		}, 'The module query parameter contains a name which is not valid: @ft/o-TeSt.');
	});

	it('returns an object where the key is the module name and the value is the version range', async () => {
		const module = {
			'@financial-times/o-table': '100',
		};

		proclaim.deepStrictEqual(
			parseModuleParameter(
				'@financial-times/o-table@100'
			),
			module
		);
	});
});
