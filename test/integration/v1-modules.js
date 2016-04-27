'use strict';

const request = require('supertest');

describe('GET /v1/modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a file is requested', function() {
		const moduleName = 'mock-module';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v1/modules/${moduleName}?foo=bar`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function(done) {
			this.request.expect(301).end(done);
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `/v2/modules/${moduleName}?foo=bar`).end(done);
		});

	});

});
