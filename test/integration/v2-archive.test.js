'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('Archived routes', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('GET /__origami/service/build/v2/files', function() {

		describe('a request with archived response', function() {
			/**
			 * @type {request.Response}
			 */
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png')
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
					// export used to cache bust, unrecognised params are removed by the archive
					.get(`/__origami/service/build/v2/files/o-comments@3.5.0/src/images/comment_featured_close_quote.png?export=${now.replace(/[^a-zA-Z0-9]/g, '')}`)
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 404 status', function() {
				assert.equal(response.status, 404);
			});
		});
	});

	describe('GET /__origami/service/build/v2/demos', function() {

		describe('a request with archived response', function() {
			/**
			* @type {request.Response}
			*/
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/demos/o-header%406.14.5/header')
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with demo HTML', function() {
				assert.include(response.headers['content-type'], 'html');
			});
		});

		describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
			/**
			* @type {request.Response}
			*/
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/demos/o-header@6.14.5/header')
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with demo HTML', function() {
				assert.include(response.headers['content-type'], 'html');
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
				// export used to cache bust, unrecognised params are removed by the archive
					.get(`/__origami/service/build/v2/demos/o-header%5E6.14.5/header&export=${now.replace(/[^a-zA-Z0-9]/g, '')}`)
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 404 status', function() {
				assert.equal(response.status, 404);
			});
		});
	});

	describe('GET /__origami/service/build/v2/demos/:fullModuleName/:demoName/html', function() {

		describe('a request with archived response', function() {
			/**
			* @type {request.Response}
			*/
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/demos/o-header%406.14.5/header/html')
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with demo HTML as plain text', function() {
				assert.include(response.headers['content-type'], 'text');
			});
		});

		describe('a request with url-decoded query parameter, with an archived response for the url-encoded version', function() {
			/**
			* @type {request.Response}
			*/
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/demos/o-header@6.14.5/header/html')
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 200 status', function() {
				assert.equal(response.status, 200);
			});

			it('should respond with demo HTML as plain text', function() {
				assert.include(response.headers['content-type'], 'text');
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
				// export used to cache bust, unrecognised params are removed by the archive
					.get(`/__origami/service/build/v2/demos/o-header%5E6.14.5/header&export=${now.replace(/[^a-zA-Z0-9]/g, '')}/html`)
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 404 status', function() {
				assert.equal(response.status, 404);
			});
		});
	});

	describe('GET /__origami/service/build/v2/bundles/css', function() {

		describe('a request with archived response', function() {
			/**
			 * @type {request.Response}
			 */
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/bundles/css?modules=o-card@%5E3.0.0')
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
					.get('/__origami/service/build/v2/bundles/css?modules=o-card@^3.0.0')
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
					// export used to cache bust, unrecognised params are removed by the archive
					.get(`/__origami/service/build/v2/bundles/css?modules=o-card@%5E3.0.0&export=${now.replace(/[^a-zA-Z0-9]/g, '')}`)
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 404 status', function() {
				assert.equal(response.status, 404);
			});
		});
	});

	describe('GET /__origami/service/build/v2/bundles/js', function() {

		describe('a request with archived response', function() {
			/**
			 * @type {request.Response}
			 */
			let response;
			before(async function () {
				response = await request(this.app)
					.get('/__origami/service/build/v2/bundles/js?modules=o-tracking')
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
					.get('/__origami/service/build/v2/bundles/js?modules=o-tracking')
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
					// export used to cache bust, unrecognised params are removed by the archive
					.get(`/__origami/service/build/v2/bundles/js?modules=o-tracking&export=${now.replace(/[^a-zA-Z0-9]/g, '')}`)
					.redirects(5)
					.set('Connection', 'close');
			});

			it('should respond with a 404 status', function() {
				assert.equal(response.status, 404);
			});
		});
	});
});



