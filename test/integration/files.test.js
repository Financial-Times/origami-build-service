'use strict';

const request = require('supertest');

describe('GET /files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and file path are requested', function() {
		const moduleName = 'o-test-component@1.0.13';
		const pathName = 'readme.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function(done) {
			this.request.expect(301).end(done);
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `${this.basepath}v2/files/${moduleName}/${pathName}`).end(done);
		});

	});

});
