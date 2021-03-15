/* eslint-disable new-cap */
'use strict';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const fs = require('fs').promises;
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);

describe('lib/utils/JSONParseIfExists', function() {
	let JSONParseIfExists;

	beforeEach(function() {
		JSONParseIfExists = require('../../../../lib/utils/JSONParseIfExists').JSONParseIfExists;
	});

	it('should be a function', function() {
		assert.isFunction(JSONParseIfExists);
	});

	describe('JSONParseIfExists(path)', function() {

		describe('when `path` points to a file which does not exist', function() {

			it('returns `undefined`', function() {
				assert.eventually.isUndefined(JSONParseIfExists('./file-does-not-exist'));
			});

		});

		describe('when `path` points to a file which does exist', function() {

			context('file is JSON', function() {
				const value = {number: 13.7};
				beforeEach(async function() {
					await fs.writeFile('./file-does-exist', JSON.stringify(value));
				});
				afterEach(async function() {
					await rmrf('./file-does-exist');
				});

				it('returns the file parsed as JSON', function() {
					assert.eventually.deepEqual(JSONParseIfExists('./file-does-not-exist'), value);
				});

			});

			context('file is not JSON', function() {

				beforeEach(async function() {
					await fs.writeFile('./file-does-exist', 'hello this file does not contain json');
				});
				afterEach(async function() {
					await rmrf('./file-does-exist');
				});

				it('returns a rejected promise with an error', function() {
					assert.isRejected(JSONParseIfExists('./file-does-not-exist'));
				});

			});
		});
	});
});
