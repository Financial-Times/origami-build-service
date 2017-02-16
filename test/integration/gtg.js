'use strict';

const request = require('supertest');

describe('GET /__gtg', function () {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function () {
		this.request = request(this.app)
			.get('/__gtg')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function (done) {
		this.request.expect(200).end(done);
	});

	it('should respond with UTF-8 text', function (done) {
		this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
	});

	it('should contain OK', function (done) {
		this.request.expect('OK').end(done);
	});

});
