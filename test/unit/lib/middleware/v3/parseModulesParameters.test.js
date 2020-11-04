/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseModulesParameter,
} = require('../../../../../lib/middleware/v3/parseModulesParameter');

describe('parseModulesParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseModulesParameter);
	});
	it('throws UserError if modules parameter is empty string', async () => {
		proclaim.throws(() => {
			parseModulesParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('');
		}, 'The modules query parameter can not be empty.');
	});

	it('throws UserError if modules parameter contains duplicates', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-test@1,o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-test@1,o-test@1');
		}, 'The modules query parameter contains duplicate module names.');
	});

	it('throws UserError if modules parameter contains empty module names', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-test@1,,');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-test@1,,');
		}, 'The modules query parameter can not contain empty module names.');
	});

	it('throws UserError if modules parameter contains module name with whitespace at the start', async () => {
		proclaim.throws(() => {
			parseModulesParameter(' o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter(' @ft/o-test@1');
		}, 'The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from " @ft/o-test@1" to make the module name valid.');
	});

	it('throws UserError if modules parameter contains module name with whitespace at the end', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-test@1 ');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-test@1 ');
		}, 'The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from "o-test@1 " to make the module name valid.');

		proclaim.throws(() => {
			parseModulesParameter('@ft/o-test@1 ');
		}, 'The modules query parameter contains module names which have whitespace at either the start of end of their name. Remove the whitespace from "@ft/o-test@1 " to make the module name valid.');
	});

	it('throws UserError if modules parameter contains module name without a version', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-test');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-test');
		}, 'The bundle request contains o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseModulesParameter('@ft/o-test');
		}, 'The bundle request contains @ft/o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if modules parameter contains module name with an invalid version', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-test@5wg');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-test@5wg');
		}, 'The version 5wg in o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseModulesParameter('@ft/o-test@5wg');
		}, 'The version 5wg in @ft/o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if modules parameter contains invalid module names', async () => {
		proclaim.throws(() => {
			parseModulesParameter('o-TeSt@5');
		}, UserError);

		proclaim.throws(() => {
			parseModulesParameter('o-TeSt@5');
		}, 'The modules query parameter contains module names which are not valid: o-TeSt.');

		proclaim.throws(() => {
			parseModulesParameter('@ft/o-TeSt@5');
		}, 'The modules query parameter contains module names which are not valid: @ft/o-TeSt.');
	});

	it('returns aa object where the key is the module name and the value is the version range', async () => {
		const modules = {
			lodash: '^5',
			preact: '^10.5.5',
			'@financial-times/o-table': '100',
		};

		proclaim.deepStrictEqual(
			parseModulesParameter(
				'lodash@^5,preact@^10.5.5,@financial-times/o-table@100'
			),
			modules
		);
	});
});
