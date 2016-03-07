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
		let response;
		let status;
		let location;
		let body;

		beforeEach(function() {
			response = express.createMockResponse();
			status = 301;
			location = 'foo';
			body = 'bar';
			redirectWithBody(response, status, location, body);
		});

		it('should set the response status', function() {
			assert.calledOnce(response.status);
			assert.calledWithExactly(response.status, status);
		});

		it('should set the response location', function() {
			assert.calledOnce(response.location);
			assert.calledWithExactly(response.location, location);
		});

		it('should send the response body', function() {
			assert.calledOnce(response.send);
			assert.calledWithExactly(response.send, body);
		});

	});

});
