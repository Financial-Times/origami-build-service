/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseComponentsParameter,
} = require('../../../../../lib/middleware/v3/parseComponentsParameter');

describe('parseComponentsParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseComponentsParameter);
	});
	it('throws UserError if components parameter is empty string', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('');
		}, 'The components query parameter can not be empty.');
	});

	it('throws UserError if components parameter contains duplicates', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test@1,o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test@1,o-test@1');
		}, 'The components query parameter contains duplicate component names.');
	});

	it('throws UserError if components parameter contains empty component names', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test@1,,');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test@1,,');
		}, 'The components query parameter can not contain empty component names.');
	});

	it('throws UserError if components parameter contains component name with whitespace at the start', async () => {
		proclaim.throws(() => {
			parseComponentsParameter(' o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter(' o-test@1');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from ` o-test@1` to make the component name valid.');
	});

	it('throws UserError if components parameter contains component name with whitespace at the end', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test@1 ');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test@1 ');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid.');

		proclaim.throws(() => {
			parseComponentsParameter('o-test@1 ');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid.');
	});

	it('throws UserError if components parameter contains component name without a version', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test');
		}, 'The bundle request contains o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseComponentsParameter('o-test');
		}, 'The bundle request contains o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if components parameter contains component name with an invalid version', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test@5wg');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test@5wg');
		}, 'The version 5wg in o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseComponentsParameter('o-test@5wg');
		}, 'The version 5wg in o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if components parameter contains invalid component names', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-TeSt@5');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-TeSt@5');
		}, 'The components query parameter contains component names which are not valid: o-TeSt.');

		proclaim.throws(() => {
			parseComponentsParameter('o-TeSt@5');
		}, 'The components query parameter contains component names which are not valid: o-TeSt.');
	});

	it('returns an object where the key is the component name and the value is the version range', async () => {
		const components = {
			'@financial-times/o-test-component': '^13.7.0',
			'@financial-times/o-table': '100',
		};

		proclaim.deepStrictEqual(
			parseComponentsParameter(
				'o-test-component@^13.7.0,o-table@100'
			),
			components
		);
	});
});
