'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('Archived routes', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('Archive behaviour set to "full"', function() {
		before(function () {
			process.env.ARCHIVE = 'full';
		});

		describe('GET /v2/bundles/css', function() {

			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/css?modules=o-card@%5E3.0.0')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});
			});

			describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/css?modules=o-card@^3.0.0')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/bundles/css?modules=o-card@%5E3.0.0&test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 404 status', function() {
					assert.equal(response.status, 404);
				});
			});
		});

		describe('GET /v2/bundles/js', function() {

			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/js?modules=o-tracking')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});
			});

			describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/js?modules=o-tracking')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/bundles/js?modules=o-tracking&test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 404 status', function() {
					assert.equal(response.status, 404);
				});
			});
		});

		describe('GET /v2/files', function() {

			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the file', function() {
					assert.include(response.headers['content-type'], 'png');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png?test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 404 status', function() {
					assert.equal(response.status, 404);
				});
			});
		});
	});

	describe('Archive behaviour set to "fallback"', function() {
		before(function () {
			process.env.ARCHIVE = 'fallback';
		});

		describe('GET /v2/bundles/css', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/css?modules=o-card@%5E3.0.0')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});

				it('uses archive cache control policy', function() {
					assert.include(response.headers['cache-control'], 's-maxage=600');
				});
			});

			describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/css?modules=o-card@^3.0.0')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});

				it('uses archive cache control policy', function() {
					assert.include(response.headers['cache-control'], 's-maxage=600');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/bundles/css?modules=o-card@%5E3.0.0&test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});

		describe('GET /v2/bundles/js', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/js?modules=o-tracking')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});

				it('uses archive cache control policy', function() {
					assert.include(response.headers['cache-control'], 's-maxage=600');
				});
			});

			describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/js?modules=o-tracking')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});

				it('uses archive cache control policy', function() {
					assert.include(response.headers['cache-control'], 's-maxage=600');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/bundles/js?modules=o-tracking&test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});

		describe('GET /v2/files', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the file', function() {
					assert.include(response.headers['content-type'], 'png');
				});

				it('uses archive cache control policy', function() {
					assert.include(response.headers['cache-control'], 's-maxage=600');
				});
			});

			describe('a request with no response saved in the archive', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					const now = (new Date()).toISOString();
					response = await request(this.app)
						.get(`/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png?test-archive-miss=${now}`)
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the file', function() {
					assert.include(response.headers['content-type'], 'png');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});
	});

	describe('Archive behaviour not set', function() {
		before(function () {
			process.env.ARCHIVE = '';
		});

		describe('GET /v2/bundles/css', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/css?modules=o-card@%5E3.0.0')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled CSS', function() {
					assert.include(response.headers['content-type'], 'css');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});

		describe('GET /v2/bundles/js', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/bundles/js?modules=o-tracking')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the bundled js', function() {
					assert.include(response.headers['content-type'], 'javascript');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});

		describe('GET /v2/files', function() {
			describe('a request with archived response', function() {
				/**
				 * @type {request.Response}
				 */
				let response;
				before(async function () {
					response = await request(this.app)
						.get('/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png')
						.redirects(5)
						.set('Connection', 'close');
				});

				it('should respond with a 200 status', function() {
					assert.equal(response.status, 200);
				});

				it('should respond with the file', function() {
					assert.include(response.headers['content-type'], 'png');
				});

				it('does not have archive cache control policy', function() {
					assert.notInclude(response.headers['cache-control'], 's-maxage=600');
				});
			});
		});

	});

});



