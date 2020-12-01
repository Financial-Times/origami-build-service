/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseCallbackParameter,
} = require('../../../../../lib/middleware/v3/parseCallbackParameter');

describe('parseCallbackParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseCallbackParameter);
	});
	it('throws UserError if callback parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseCallbackParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter('');
		}, 'The callback query parameter can not be an empty string. If you want to not supply a callback then you need to remove the callback query paramter.');
	});

	it('throws UserError if callback parameter is not undefined or a string', async () => {
		proclaim.throws(() => {
			parseCallbackParameter(null);
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter(null);
		}, 'The callback query parameter must be a string or not set at all.');

		proclaim.throws(() => {
			parseCallbackParameter([1,2]);
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter([1,2]);
		}, 'The callback query parameter must be a string or not set at all.');

		proclaim.throws(() => {
			parseCallbackParameter(12);
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter(12);
		}, 'The callback query parameter must be a string or not set at all.');

		proclaim.throws(() => {
			parseCallbackParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter(true);
		}, 'The callback query parameter must be a string or not set at all.');
	});

	it('throws UserError if callback parameter contains characters other than alphanumerics, underscores, and periods', async () => {
		proclaim.throws(() => {
			parseCallbackParameter('/*');
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter('/*');
		}, 'The callback query parameter must be a valid name for a JavaScript variable or function.');

		proclaim.throws(() => {
			parseCallbackParameter('console.log("you got hacked");//');
		}, UserError);

		proclaim.throws(() => {
			parseCallbackParameter('console.log("you got hacked");//');
		}, 'The callback query parameter must be a valid name for a JavaScript variable or function.');
	});

	it('returns callback parameter if it is a valid value', async () => {
		proclaim.deepStrictEqual(
			parseCallbackParameter(
				'startApplication'
			),
			'startApplication'
		);
		proclaim.deepStrictEqual(
			parseCallbackParameter(
				'app.start_application'
			),
			'app.start_application'
		);
	});
});
