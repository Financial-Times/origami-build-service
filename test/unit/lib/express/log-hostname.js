'use strict';

const assert = require('chai').assert;
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/express/log-hostname', () => {
	let express;
	let log;
	let logHostname;

	beforeEach(() => {

		log = require('../../mock/log.mock');
		mockery.registerMock('../utils/log', log);

		express = require('../../mock/express.mock');
		logHostname = require('../../../../lib/express/log-hostname');
	});

	it('exports a function', () => {
		assert.isFunction(logHostname);
	});

	describe('logHostname(request, response, next)', () => {
		let next;

		beforeEach(() => {
			next = sinon.spy();
			logHostname(express.mockRequest, express.mockResponse, next);
		});

		it('logs the hostname as "unknown/direct"', () => {
			assert.calledOnce(log.info);
			assert.calledWithExactly(log.info, 'BUILD-SERVICE-HOSTNAME: hostname=unknown/direct');
		});

		it('calls `next` with no error', () => {
			assert.calledOnce(next);
			assert.calledWithExactly(next);
		});

		describe('when the request has an `FT-Original-Url` header', () => {

			beforeEach(() => {
				log.info.reset();
				next.reset();
				express.mockRequest.headers['ft-original-url'] = 'https://build.service/foo/bar';
				logHostname(express.mockRequest, express.mockResponse, next);
			});

			it('logs the hostname as the hostname in the header value', () => {
				assert.calledOnce(log.info);
				assert.calledWithExactly(log.info, 'BUILD-SERVICE-HOSTNAME: hostname=build.service');
			});

			it('calls `next` with no error', () => {
				assert.calledOnce(next);
				assert.calledWithExactly(next);
			});

		});

	});

});
