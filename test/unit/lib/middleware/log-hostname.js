'use strict';

const assert = require('chai').assert;
const sinon = require('sinon');

describe('lib/middleware/log-hostname', () => {
	let origamiService;
	let log;
	let logHostname;

	beforeEach(() => {

		log = require('../../mock/log.mock');

		origamiService = require('../../mock/origami-service.mock');
		logHostname = require('../../../../lib/middleware/log-hostname');
	});

	it('exports a function', () => {
		assert.isFunction(logHostname);
	});

	describe('logHostname(log)', () => {
		let middleware;

		beforeEach(() => {
			middleware = logHostname(log);
		});

		it('returns a middleware function', () => {
			assert.isFunction(middleware);
		});

		describe('middleware(request, response, next)', () => {
			let next;

			beforeEach(() => {
				next = sinon.spy();
				origamiService.mockRequest.url = '/foo/bar';
				middleware(origamiService.mockRequest, origamiService.mockResponse, next);
			});

			it('logs the hostname as "unknown/direct"', () => {
				assert.calledOnce(log.info);
				assert.calledWithExactly(log.info, 'BUILD-SERVICE-HOSTNAME: hostname=unknown/direct path=/foo/bar referer=null');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

			describe('when the request has an `X-Original-Host` header', () => {

				beforeEach(() => {
					log.info.reset();
					next.reset();
					origamiService.mockRequest.url = '/foo/bar';
					origamiService.mockRequest.headers['x-original-host'] = 'build.service';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('logs the hostname as the hostname in the header value', () => {
					assert.calledOnce(log.info);
					assert.calledWithExactly(log.info, 'BUILD-SERVICE-HOSTNAME: hostname=build.service path=/foo/bar referer=null');
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the request URL has a `Referer` header', () => {

				beforeEach(() => {
					log.info.reset();
					next.reset();
					origamiService.mockRequest.url = '/foo/bar';
					origamiService.mockRequest.headers['referer'] = 'http://referer/';
					origamiService.mockRequest.headers['x-original-host'] = 'build.service';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('logs the referer as well as the hostname', () => {
					assert.calledOnce(log.info);
					assert.calledWithExactly(log.info, 'BUILD-SERVICE-HOSTNAME: hostname=build.service path=/foo/bar referer=http://referer/');
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

			describe('when the request URL begins with a double underscore', () => {

				beforeEach(() => {
					log.info.reset();
					next.reset();
					origamiService.mockRequest.url = '/__about';
					origamiService.mockRequest.headers['x-original-host'] = 'build.service';
					middleware(origamiService.mockRequest, origamiService.mockResponse, next);
				});

				it('logs nothing', () => {
					assert.strictEqual(log.info.callCount, 0);
				});

				it('calls `next` with no error', () => {
					assert.calledOnce(next);
					assert.calledWithExactly(next);
				});

			});

		});

	});

});
