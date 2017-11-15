'use strict';

const request = require('supertest');

describe('GET /robots.txt', function() {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function() {
		this.request = request(this.app)
			.get('/robots.txt')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function(done) {
		this.request.expect(200).end(done);
	});

	it('should respond with UTF-8 text', function(done) {
		this.request.expect('Content-Type', 'text/plain;charset=UTF-8').end(done);
	});

	it('should disallow bots hitting any path', function(done) {
		this.request.expect('User-Agent: *\nDisallow: /\n').end(done);
	});

});
