'use strict';

const request = require('supertest');

describe('GET /v1/modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component%401.0.16';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v1/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function(done) {
			this.request.expect(301).end(done);
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `/v2/modules/${moduleName}`).end(done);
		});

	});

});
