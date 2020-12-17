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

		it('should response with a year long surrogate cache control header', function(done) {
			if (process.env.HOST) {
				this.skip();
			} else {
				this.request
					.expect('Surrogate-Control', 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000')
					.end(done);
			}
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `${this.basepath}/v2/modules/${moduleName}`).end(done);
		});

	});

});
