'use strict';

const request = require('supertest');

describe('GET /v1/files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a file is requested', function() {
		const fileName = 'mock-file';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v1/files/${fileName}/?foo=bar`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function(done) {
			this.request.expect(301).end(done);
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `/v2/files/${fileName}/?foo=bar`).end(done);
		});

	});

});
