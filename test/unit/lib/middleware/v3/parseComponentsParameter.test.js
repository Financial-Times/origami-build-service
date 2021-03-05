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
			parseComponentsParameter('@financial-times/o-test@1,@financial-times/o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@1,@financial-times/o-test@1');
		}, 'The components query parameter contains duplicate component names.');
	});

	it('throws UserError if components parameter contains empty component names', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@1,,');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@1,,');
		}, 'The components query parameter can not contain empty component names.');
	});

	it('throws UserError if components parameter contains component name with whitespace at the start', async () => {
		proclaim.throws(() => {
			parseComponentsParameter(' @financial-times/o-test@1');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter(' @financial-times/o-test@1');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from ` @financial-times/o-test@1` to make the component name valid.');
	});

	it('throws UserError if components parameter contains component name with whitespace at the end', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('o-test@1 ');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('o-test@1 ');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `o-test@1 ` to make the component name valid.');

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@1 ');
		}, 'The components query parameter contains component names which have whitespace at either the start of end of their name. Remove the whitespace from `@financial-times/o-test@1 ` to make the component name valid.');
	});

	it('throws UserError if components parameter contains component name without a version', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test');
		}, 'The bundle request contains @financial-times/o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test');
		}, 'The bundle request contains @financial-times/o-test with no version range, a version range is required.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if components parameter contains component name with an invalid version', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@5wg');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@5wg');
		}, 'The version 5wg in @financial-times/o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-test@5wg');
		}, 'The version 5wg in @financial-times/o-test@5wg is not a valid version.\nPlease refer to TODO (build service documentation) for what is a valid version.');
	});

	it('throws UserError if components parameter contains invalid component names', async () => {
		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-TeSt@5');
		}, UserError);

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-TeSt@5');
		}, 'The components query parameter contains component names which are not valid: @financial-times/o-TeSt.');

		proclaim.throws(() => {
			parseComponentsParameter('@financial-times/o-TeSt@5');
		}, 'The components query parameter contains component names which are not valid: @financial-times/o-TeSt.');
	});

	it('throws UserError if components parameter contains components which are not from the @financial-times namespace', async () => {
		proclaim.throws(() => {
			parseComponentsParameter(
				'lodash@^5,preact@^10.5.5,@financial-times/o-table@100'
			);
		}, UserError);
		proclaim.throws(() => {
			parseComponentsParameter(
				'lodash@^5,preact@^10.5.5,@financial-times/o-table@100'
			);
		}, 'The components query parameter can only contain components from the @financial-times namespace. Please remove the following from the components parameter: lodash.');
	});
	it('returns an object where the key is the component name and the value is the version range', async () => {
		const components = {
			'@financial-times/o-test-component': '^13.7.0',
			'@financial-times/o-table': '100',
		};

		proclaim.deepStrictEqual(
			parseComponentsParameter(
				'@financial-times/o-test-component@^13.7.0,@financial-times/o-table@100'
			),
			components
		);
	});
});
