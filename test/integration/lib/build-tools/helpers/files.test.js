'use strict';

const fs = require('fs-extra');
const path = require('path');
const proclaim = require('proclaim');

const files = require('../../../../../lib/build-tools/helpers/files');

const testRoot = path.join(__dirname, '../');
const fixturePath = path.join(testRoot, 'fixtures/o-test');

describe('Files helper', () => {
	let testPath;

	beforeEach(() => {
		testPath = path.join(testRoot, `.test-run-files-${Date.now()}`);
		fs.copySync(fixturePath, testPath);
	});

	afterEach(() => {
		fs.removeSync(testPath);
	});

	describe('.getModuleName(basePath)', () => {
		it('should return an empty string give no bower.json', function () {
			fs.removeSync(path.join(testPath, 'bower.json'));
			proclaim.equal(files.getModuleName(testPath), '');
		});

		it('should return module name given a bower.json with a name property', function() {
			proclaim.equal(files.getModuleName(testPath), 'o-test');
		});
	});

	describe('.getMustacheFilesList(basePath)', () => {
		let mustacheTestPath;
		let flatMustacheFiles;
		let nestedMustacheFiles;

		beforeEach(() => {
			mustacheTestPath = path.join(testPath, 'demos/src');
			flatMustacheFiles = path.join(mustacheTestPath, 'flat');
			nestedMustacheFiles = path.join(mustacheTestPath, 'nested');
		});

		it('is a function', () => {
			proclaim.isTypeOf(files.getMustacheFilesList, 'function');
		});

		it('returns an array', () => {
			const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
			proclaim.isArray(mustacheFiles);
		});

		describe('when the directory structure is one level deep', () => {

			it('returns an array of all of the mustache files in the directory', () => {
				const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
				proclaim.deepEqual(mustacheFiles, [
					path.join(flatMustacheFiles, 'example-1.mustache'),
					path.join(flatMustacheFiles, 'example-2.mustache')
				]);
			});

		});

		describe('when the directory structure has subdirectories', () => {

			it('returns an array of all of the mustache files in the directory and all subdirectories', () => {
				const mustacheFiles = files.getMustacheFilesList(nestedMustacheFiles);
				proclaim.deepEqual(mustacheFiles, [
					path.join(nestedMustacheFiles, 'example-1.mustache'),
					path.join(nestedMustacheFiles, 'example-2.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/example-3.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/folder-2/example-4.mustache')
				]);
			});

		});

	});

});
