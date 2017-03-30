'use strict';

const request = require('supertest');

describe('GET /v2', function() {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function() {
		this.request = request(this.app)
			.get('/v2')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function(done) {
		this.request.expect(200).end(done);
	});

	it('should respond with HTML', function(done) {
		this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
	});

	it('should respond with the build service documentation', function(done) {
		this.request.expect(/origami build service/i).end(done);
	});

});
