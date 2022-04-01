'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a module is requested', function() {
		const moduleName = 'mock-modules/test-ok';
		const now = (new Date()).toISOString();

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`);
		});

	});

	// These tests are not possible to run against a remote server because they require a set of fixture files to exist, which do not exist on our remote servers.
	if (!process.env.HOST) {
		describe('when a module is requested that has a static bundle', function() {
			const moduleName = 'mock-modules/test-static';

			/**
		 * @type {request.Response}
		 */
			let response;
			before(async function () {
				response = await request(this.app)
					.get(`/bundles/js?modules=${moduleName}`)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'application/javascript; charset=utf-8');
			});

			it('should respond with the contents of the static bundle', function() {
				assert.deepEqual(response.text, '/* STATIC BUNDLE (bundles/js) */\n');
			});

			it('should ignore URL encoding when checking for static bundles', function() {
				const pathUnencoded = `/bundles/js?modules=${moduleName}^1.0.0`;
				const pathEncoded = `/bundles/js?modules=${moduleName}%5E1.0.0`;
				const expectedContent = '/* STATIC BUNDLE (bundles/js) */\n';

				request(this.app)
					.get(pathUnencoded)
					.set('Connection', 'close')
					.expect(expectedContent)
					.end(() => {
						request(this.app)
							.get(pathEncoded)
							.set('Connection', 'close')
							.expect(expectedContent)
						;
					});
			});

		});
	}
});

describe('GET /__origami/service/build/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a module is requested', function() {
		const moduleName = 'mock-modules/test-ok';
		const now = (new Date()).toISOString();

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`);
		});

	});

	// These tests are not possible to run against a remote server because they require a set of fixture files to exist, which do not exist on our remote servers.
	if (!process.env.HOST) {
		describe('when a module is requested that has a static bundle', function() {
			const moduleName = 'mock-modules/test-static';

			/**
		 * @type {request.Response}
		 */
			let response;
			before(async function () {
				response = await request(this.app)
					.get(`/__origami/service/build/bundles/js?modules=${moduleName}`)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'application/javascript; charset=utf-8');
			});

			it('should respond with the contents of the static bundle', function() {
				assert.deepEqual(response.text, '/* STATIC BUNDLE (bundles/js) */\n');
			});

			it('should ignore URL encoding when checking for static bundles', function() {
				const pathUnencoded = `/__origami/service/build/bundles/js?modules=${moduleName}^1.0.0`;
				const pathEncoded = `/__origami/service/build/bundles/js?modules=${moduleName}%5E1.0.0`;
				const expectedContent = '/* STATIC BUNDLE (bundles/js) */\n';

				request(this.app)
					.get(pathUnencoded)
					.set('Connection', 'close')
					.expect(expectedContent)
					.end(() => {
						request(this.app)
							.get(pathEncoded)
							.set('Connection', 'close')
							.expect(expectedContent)
						;
					});
			});

		});
	}
});
