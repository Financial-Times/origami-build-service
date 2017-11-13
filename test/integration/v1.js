'use strict';

const request = require('supertest');

describe('GET /v1', function() {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function() {
		this.request = request(this.app)
			.get('/v1')
			.set('Connection', 'close');
	});

	it('should respond with a 301 status', function(done) {
		this.request.expect(301).end(done);
	});

	it('should response with a year long surrogate cache control header', function(done) {
		this.request
			.expect('Surrogate-Control', 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000')
			.end(done);
	});

	it('should respond with HTML', function(done) {
		this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
	});

	it('should respond with the build service documentation', function(done) {
			this.request.expect('Moved Permanently. Redirecting to /v2/').end(done);
	});

});
