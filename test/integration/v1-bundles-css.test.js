'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v1/bundles/css', function() {
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
				.get(`/v1/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should response with a year long surrogate cache control header', function() {
			// This test is not possible to run against a remote server which is behind a CDN such as Fastly because CDN's remove the Surrogate-Control header
			if (process.env.HOST) {
				this.skip();
			} else {
				assert.deepEqual(response.headers['surrogate-control'], 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000');
			}
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `${this.basepath}v2/bundles/css?modules=${moduleName}&newerthan=${now}`);
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
					.get(`/v1/bundles/css?modules=${moduleName}`)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/css; charset=utf-8');
			});

			it('should respond with the contents of the static bundle', function() {
				assert.deepEqual(response.text, '/* STATIC BUNDLE (v1/bundles/css) */\n');
			});

			it('should ignore URL encoding when checking for static bundles', function() {
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
						;
					});
			});

		});
	}

});
