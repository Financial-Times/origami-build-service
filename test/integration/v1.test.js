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
		// This test is not possible to run against a remote server which is behind a CDN such as Fastly because CDN's remove the Surrogate-Control header
		if (process.env.HOST) {
			this.skip();
		} else {
			this.request
				.expect('Surrogate-Control', 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000')
				.end(done);
		}
	});

	it('should respond with HTML', function(done) {
		this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
	});

});
