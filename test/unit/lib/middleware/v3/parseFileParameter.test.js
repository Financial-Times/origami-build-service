/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const UserError = require('../../../../../lib/utils/usererror');
const {
	parseFileParameter,
} = require('../../../../../lib/middleware/v3/parseFileParameter');

describe('parseFileParameter', () => {
	it('it is a function', async () => {
		proclaim.isFunction(parseFileParameter);
	});
	it('throws UserError if file parameter is an empty string', async () => {
		proclaim.throws(() => {
			parseFileParameter('');
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter('');
		}, 'The file query parameter can not be an empty string.');
	});

	it('throws UserError if file parameter is not undefined or a string', async () => {
		proclaim.throws(() => {
			parseFileParameter(null);
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter(null);
		}, 'The file query parameter must be a string.');

		proclaim.throws(() => {
			parseFileParameter([1,2]);
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter([1,2]);
		}, 'The file query parameter must be a string.');

		proclaim.throws(() => {
			parseFileParameter(12);
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter(12);
		}, 'The file query parameter must be a string.');

		proclaim.throws(() => {
			parseFileParameter(true);
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter(true);
		}, 'The file query parameter must be a string.');
	});

	it('throws UserError if file parameter is attempting to reference a file outside of the component\'s folder', async () => {
		proclaim.throws(() => {
			parseFileParameter('../../../etc/passwd');
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter('../../../etc/passwd');
		}, 'The file query parameter must be a path within the requested component.');

		proclaim.throws(() => {
			parseFileParameter('./hello/../../secret-file.txt');
		}, UserError);

		proclaim.throws(() => {
			parseFileParameter('./hello/../../secret-file.txt');
		}, 'The file query parameter must be a path within the requested component.');
	});

	it('returns file parameter if it is a valid value', async () => {
		proclaim.deepStrictEqual(
			parseFileParameter(
				'./origami.json'
			),
			'./origami.json'
		);
		proclaim.deepStrictEqual(
			parseFileParameter(
				'./src/js/main.js'
			),
			'./src/js/main.js'
		);
	});
});
