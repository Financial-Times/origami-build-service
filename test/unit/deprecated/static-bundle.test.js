'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('deprecated/static-bundle', function() {
	let fs;
	let pfs;
	let staticBundle;
	let uniqueid;

	beforeEach(function() {

		uniqueid = require('../mock/uniqueid.mock');
		mockery.registerMock('../lib/utils/uniqueid', uniqueid);

		fs = require('../mock/fs.mock');
		mockery.registerMock('fs', fs);

		pfs = require('../mock/q-io-fs.mock');
		mockery.registerMock('q-io/fs', pfs);

		staticBundle = require('../../../deprecated/static-bundle');
	});

	it('should export an object', function() {
		assert.isObject(staticBundle);
	});

	it('should have a `getStaticBundleStream` method', function() {
		assert.isFunction(staticBundle.getStaticBundleStream);
	});

	describe('.getStaticBundleStream(url, staticBundlesDirectory)', function() {
		let returnedPromise;
		let fileStats;
		const staticBundlesDirectory = '/test-static-bundles';
		const url = 'http://example.com/foo/bar?a=b';

		beforeEach(function() {
			fileStats = {
				isFile: sinon.stub().returns(true)
			};
			pfs.stat.resolves(fileStats);
			staticBundle.getStaticBundleFilePath = sinon.stub().returns('mock-file-path');
			returnedPromise = staticBundle.getStaticBundleStream(url, staticBundlesDirectory);
		});

		it('should get the static bundle file path', function() {
			assert.calledOnce(staticBundle.getStaticBundleFilePath);
			assert.calledWithExactly(staticBundle.getStaticBundleFilePath, url, staticBundlesDirectory);
		});

		it('should stat the static bundle file path', function() {
			assert.calledOnce(pfs.stat);
			assert.calledWithExactly(pfs.stat, 'mock-file-path');
		});

		it('should return a promise', function() {
			assert.instanceOf(returnedPromise, Promise);
		});

		describe('.then()', function() {
			let resolvedValue;

			beforeEach(function(done) {
				returnedPromise.then(function(value) {
					resolvedValue = value;
					done();
				}).catch(done);
			});

			it('should check that the static bundle file path points to a file', function() {
				assert.calledOnce(fileStats.isFile);
			});

			it('should create a read stream for the static bundle file path', function() {
				assert.calledOnce(fs.createReadStream);
				assert.calledWithExactly(fs.createReadStream, 'mock-file-path');
			});

			it('should be called with the file stream as a resolved value', function() {
				assert.strictEqual(resolvedValue, fs.createReadStream.firstCall.returnValue);
			});

		});

		describe('when the static bundle file path does not point to a file', function() {

			beforeEach(function() {
				fileStats.isFile.returns(false);
			});

			describe('.catch()', function() {
				let caughtError;

				beforeEach(function(done) {
					returnedPromise = staticBundle.getStaticBundleStream(url, staticBundlesDirectory);
					returnedPromise.catch(function(error) {
						caughtError = error;
						done();
					});
				});

				it('should be called with the expected error', function() {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Static bundle is not a file');
				});

			});

		});

	});

	it('should have a `getStaticBundleFilePath` method', function() {
		assert.isFunction(staticBundle.getStaticBundleFilePath);
	});

	describe('.getStaticBundleFilePath(url, staticBundlesDirectory)', function() {
		let returnValue;
		const staticBundlesDirectory = '/test-static-bundles';
		let url = 'http://example.com/foo/bar?a=b';

		beforeEach(function() {
			uniqueid.returns('mock-unique-id');
			returnValue = staticBundle.getStaticBundleFilePath(url, staticBundlesDirectory);
		});

		it('should create a unique ID based on the URL path', function() {
			assert.calledOnce(uniqueid);
			assert.calledWithExactly(uniqueid, '/foo/bar?a=b', 64);
		});

		it('should return the expected file path', function() {
			assert.strictEqual(returnValue, '/test-static-bundles/mock-unique-id');
		});

		describe('when `url` has encoded characters in the path', function() {

			beforeEach(function() {
				url = 'http://example.com/foo/bar?a=b@%5Ec';
				uniqueid.reset();
				returnValue = staticBundle.getStaticBundleFilePath(url, staticBundlesDirectory);
			});

			it('should decode the URL before creating the unique ID', function() {
				assert.calledWithExactly(uniqueid, '/foo/bar?a=b@^c', 64);
			});

		});

		describe('when `staticBundlesDirectory` is not defined', function() {

			beforeEach(function() {
				uniqueid.reset();
				returnValue = staticBundle.getStaticBundleFilePath(url);
			});

			it('should use a default static bundles directory', function() {
				assert.strictEqual(returnValue, path.resolve(__dirname, '../../../deprecated/static-bundles', 'mock-unique-id'));
			});

		});

	});

});
