'use strict';

const assert = require('chai').assert;

describe('lib/express/redirect-with-body', function() {
	let express;
	let redirectWithBody;

	beforeEach(function() {
		express = require('../../mock/express.mock');
		redirectWithBody = require('../../../../lib/express/redirect-with-body');
	});

	it('should export a function', function() {
		assert.isFunction(redirectWithBody);
	});

	describe('redirectWithBody(response, status, location, body)', function() {
		let status;
		let location;
		let body;

		beforeEach(function() {
			status = 301;
			location = 'foo';
			body = 'bar';
			redirectWithBody(express.mockResponse, status, location, body);
		});

		it('should set the response status', function() {
			assert.calledOnce(express.mockResponse.status);
			assert.calledWithExactly(express.mockResponse.status, status);
		});

		it('should set the response location', function() {
			assert.calledOnce(express.mockResponse.location);
			assert.calledWithExactly(express.mockResponse.location, location);
		});

		it('should send the response body', function() {
			assert.calledOnce(express.mockResponse.send);
			assert.calledWithExactly(express.mockResponse.send, body);
		});

	});

});
