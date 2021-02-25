/* eslint-disable new-cap */
'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const fs = require('fs').promises;
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);

describe('lib/utils/readIfExists', function () {
	let readIfExists;

	beforeEach(function () {
		readIfExists = require('../../../../lib/utils/readIfExists').readIfExists;
	});

	it('should be a function', function () {
		assert.isFunction(readIfExists);
	});

	describe('readIfExists(path)', function () {
		describe('when `path` points to a file which does not exist', function () {
			it('returns promise which resolves to `undefined`', function () {
				assert.eventually.isUndefined(readIfExists('./file-does-not-exist'));
			});
		});

		describe('when `path` points to a file which does exist', function () {
			const value = '{number: 13.7}';
			beforeEach(async function () {
				await fs.writeFile('./file-does-exist', value);
			});
			afterEach(async function () {
				await rmrf('./file-does-exist');
			});

			it('returns a promise which resolve to the contents of the file as a string', function () {
				assert.eventually.deepEqual(
					readIfExists('./file-does-not-exist'),
					value
				);
			});
		});
	});
});
