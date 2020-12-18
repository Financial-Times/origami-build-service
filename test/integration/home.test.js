'use strict';

const request = require('supertest');

describe('GET /', function() {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function() {
		this.request = request(this.app)
			.get('/')
			.set('Connection', 'close');
	});

	it('should respond with a 301 status', function(done) {
		this.request.expect(301).end(done);
	});

	it('should respond with a v2 `Location` header', function(done) {
		this.request.expect('Location', `${this.basepath}v2/`).end(done);
	});

	it('should respond with HTML', function(done) {
		this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
	});

});
