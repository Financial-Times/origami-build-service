'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/middleware/outputFile', () => {
	let cacheControlHeaderFromExpiry;
	let fileproxy;
	let HttpError;
	let installationmanager;
	let metrics;
	let outputFile;

	beforeEach(() => {
		cacheControlHeaderFromExpiry = require('../../mock/cacheControlHeaderFromExpiry.mock');
		mockery.registerMock('../utils/cacheControlHeaderFromExpiry', cacheControlHeaderFromExpiry);

		fileproxy = require('../../mock/fileproxy.mock');
		mockery.registerMock('../fileproxy', fileproxy);

		HttpError = require('../../mock/httperror.mock');
		mockery.registerMock('../express/httperror', HttpError);

		installationmanager = require('../../mock/installationmanager.mock');
		mockery.registerMock('../installationmanager', installationmanager);

		metrics = require('../../mock/metrics.mock');
		mockery.registerMock('../monitoring/metrics', metrics);

		outputFile = require('../../../../lib/middleware/outputFile');
	});

	it('exports a function', () => {
		assert.isFunction(outputFile);
	});

	describe('outputFile(config)', () => {
		let config;
		let middleware;

		beforeEach(() => {
			config = {
				tempdir: '/tmp',
				registry: {}
			};
			middleware = outputFile(config);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
			});

			describe('when hit via a HEAD request', () => {
				it('returns a 200 response with no body and all the headers');
			});

			describe('when request has an if-modified-since header', () => {
				describe('which is the same as the files mtime', () => {
					it('returns a 304 response with no body and all the headers');
				});
			});

			it('uses files mimetype as the content-type of the response');

			it('uses files mtime as the last-modified time of the response');

			it('uses files expiry-time as the cache-control of the response');

			it('sets access-control-allow-origin to allow all origins');

			describe('when file requested is text and less than 5000000', () => {
				it('sets content-length to length of file');
			});

			describe('when file requested is html and less than 5000000', () => {
				it('sets content-length to length of file');
			});

			describe('when getFileInfo throws a generic error', () => {
				let getFileInfoError;

				beforeEach(() => {
					next.reset();
					getFileInfoError = new Error('Generic error.');
					getFileInfoError.code = 123;
					fileproxy.mockFileproxy.getFileInfo.rejects(getFileInfoError);
					return middleware({
						originalUrl: ''
					}, {}, next);
				});

				it('wraps the error calls `next` with the wrapped error', () => {
					assert.calledOnce(next);
					assert.equal(next.firstCall.args[0].message, 'Can\'t get info about file from URL \'\': Generic error.');
					assert.deepEqual(next.firstCall.args[0].parentError, getFileInfoError);
					assert.equal(next.firstCall.args[0].code, 123);
				});

			});

			describe('when getFileInfo throws an HTTP error', () => {
				let getFileInfoError;

				beforeEach(() => {
					next.reset();
					getFileInfoError = new HttpError('Generic error.');
					getFileInfoError.code = 123;
					fileproxy.mockFileproxy.getFileInfo.rejects(getFileInfoError);
					return middleware({
						originalUrl: ''
					}, {}, next);
				});

				it('wraps the error calls `next` with the wrapped error', () => {
					assert.calledOnce(next);
					assert.deepEqual(next.firstCall.args[0], getFileInfoError);
				});

			});
		});

	});

});
