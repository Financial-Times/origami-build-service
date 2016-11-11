'use strict';

const request = require('supertest');

describe('GET /v1/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a module is requested', function() {
		const moduleName = 'mock-modules/test-ok';
		const now = (new Date()).toISOString();

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v1/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function(done) {
			this.request.expect(301).end(done);
		});

		it('should respond with a v2 `Location` header', function(done) {
			this.request.expect('Location', `/v2/bundles/css?modules=${moduleName}&newerthan=${now}`).end(done);
		});

	});

	describe('when a module is requested that has a static bundle', function() {
		const moduleName = 'mock-modules/test-static';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v1/bundles/css?modules=${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/css; charset=utf-8').end(done);
		});

		it('should respond with the contents of the static bundle', function(done) {
			this.request.expect('/* STATIC BUNDLE (v1/bundles/css) */\n').end(done);
		});

		it('should ignore URL encoding when checking for static bundles', function(done) {
			const pathUnencoded = `/v1/bundles/css?modules=${moduleName}^1.0.0`;
			const pathEncoded = `/v1/bundles/css?modules=${moduleName}%5E1.0.0`;
			const expectedContent = '/* STATIC BUNDLE (v1/bundles/css) */\n';

			request(this.app)
				.get(pathUnencoded)
				.set('Connection', 'close')
				.expect(expectedContent)
				.end(() => {
					request(this.app)
						.get(pathEncoded)
						.set('Connection', 'close')
						.expect(expectedContent)
						.end(done);
				});
		});

	});

});
