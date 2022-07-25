/* eslint-disable new-cap */
'use strict';

const path = require('path');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const assert = chai.assert;
const fs = require('fs').promises;
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);

describe('lib/utils/getOrigamiJson', function() {
	let getOrigamiJson;

	beforeEach(function() {
		getOrigamiJson = require('../../../../lib/utils/getOrigamiJson').getOrigamiJson;
	});

	it('should be a function', function() {
		assert.isFunction(getOrigamiJson);
	});

	describe('getOrigamiJson(path)', function() {

		describe('when `path` points to a directory which does not exist', function() {

			it('returns `undefined`', function() {
				assert.eventually.isUndefined(getOrigamiJson('./directory-does-not-exist'));
			});

		});

		describe('when `path` points to a directory which does not contain an origami.json file', function() {
			let tmpDir;
			beforeEach(async function() {
				tmpDir = await fs.mkdtemp('./directory-does-exist');
			});
			afterEach(async function() {
				await rmrf(tmpDir);
			});

			it('returns `undefined`', function() {
				assert.eventually.isUndefined(getOrigamiJson('./directory-does-not-exist'));
			});
		});

		describe('when `path` points to a directory which does contain an origami.json file', function() {

			context('origami.json file contains JSON', function() {
				const value = {number: 13.7};
				const directory = path.join(__dirname, './directory-does-exist');
				beforeEach(async function() {
					await fs.mkdir(directory);
					await fs.writeFile(path.join(directory, './origami.json'), JSON.stringify(value));
				});
				afterEach(async function() {
					await rmrf(directory);
				});

				it('returns the file parsed as JSON', function() {
					assert.eventually.deepEqual(getOrigamiJson(directory), value);
				});

			});

			context('origami.json file does not contain JSON', function() {

				const directory = path.join(__dirname, './directory-does-exist');
				beforeEach(async function() {
					await fs.mkdir(directory);
					await fs.writeFile(path.join(directory, './origami.json'), 'hello this file does not contain json');
				});
				afterEach(async function() {
					await rmrf(directory);
				});

				it('returns a rejected promise with an error', function() {
					assert.isRejected(getOrigamiJson('./directory-does-exist'));
				});

			});
		});
	});
});
