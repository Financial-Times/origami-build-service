'use strict';

const assert = require('chai').assert;

describe('lib/express/redirect-with-body', function() {
	let origamiService;
	let redirectWithBody;

	beforeEach(function() {
		origamiService = require('../../mock/origami-service.mock');
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
			redirectWithBody(origamiService.mockResponse, status, location, body);
		});

		it('should set the response status', function() {
			assert.calledOnce(origamiService.mockResponse.status);
			assert.calledWithExactly(origamiService.mockResponse.status, status);
		});

		it('should set the response location', function() {
			assert.calledOnce(origamiService.mockResponse.location);
			assert.calledWithExactly(origamiService.mockResponse.location, location);
		});

		it('should send the response body', function() {
			assert.calledOnce(origamiService.mockResponse.send);
			assert.calledWithExactly(origamiService.mockResponse.send, body);
		});

	});

});
