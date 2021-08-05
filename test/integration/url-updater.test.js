'use strict';

const request = require('supertest');
const cheerio = require('cheerio');
const {assert} = require('chai');

describe('GET /url-updater', function () {
	this.timeout(20000);
	this.slow(5000);

	/**
	 * @type {request.Response}
	 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/url-updater')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function () {
		assert.equal(response.status, 200);
	});

	it('should respond with surrogate-key containing `website`', function() {
		assert.deepEqual(response.headers['surrogate-key'], 'website');
	});

	it('should include a build service url input', function () {
		const $ = cheerio.load(response.text);
		const element = $('input[name="build-service-url"]');
		assert.ok(element.length, 'Could not find input of name "build-service-url".');
	});
});

describe('POST /url-updater', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('with a valid build service url', function () {
		const modules = 'o-test-component@^1.0.0';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}%26brand=internal%26system_code=origami`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with an updated build service url', function () {
			// expect a release of v2 or later in the updated url
			assert.match(response.text, /components&#x3D;o-test-component@\^([2-9]|\d\d+)/);
		});

		it('should not mention missing query parameters', function () {
			// expect a release of v2 or later in the updated url
			assert.notInclude(response.text, 'missing query parameter');
		});

		it('should not be cached by fastly', function () {
			assert.deepEqual(
				response.headers['cache-control'],
				'max-age=0, must-revalidate, no-cache, no-store, private'
			);
		});
	});

	describe('with a valid build service url which contains a very outdated component request', function () {
		const modules = 'o-forms@^7.1.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}%26brand=internal%26system_code=origami`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with an updated build service v2 url (not v3)', function () {
			// so users may upgrade components to their last Bower version before
			// then migrating to v3 of the Origami Build Service
			assert.include(response.text, 'v2/bundles/css?modules&#x3D;o-forms@^8.0.0');
		});

		it('should respond with an updated build service v2 url (not v3)', function () {
			// so users may upgrade components to their last Bower version before
			// then migrating to v3 of the Origami Build Service
			assert.include(response.text, 'v2/bundles/css?modules&#x3D;o-forms@^8.0.0');
		});

		it('does not mention autoinit', function () {
			// o-autoinit is included by default in OBS v2, no changes
			// should be recommended
			assert.include(response.text, 'autoinit');
		});

		it('should respond with an explanation to migrate to the latest Bower release first', function () {
			assert.include(response.text, 'not compatible with the latest version of the Origami Build Service');
			assert.include(response.text, 'We recommend upgrading your components incrementally.');
		});
	});

	describe('with an outdated build service url and missing parameters', function () {
		const modules = 'o-test-component@^1.0.0';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with an updated build service url', function () {
			// expect a release of v2 or later in the updated url
			assert.match(response.text, /components&#x3D;o-test-component@\^([2-9]|\d\d+)/);
		});

		it('should specify that o-autoinit is required', function () {
			// o-autoinit is included by default in OBS v2 but not in v3
			assert.include(response.text, 'o-autoinit');
		});

		it('should specify that the brand and system_code query parameters are missing', function () {
			// expect a release of v2 or later in the updated url
			assert.include(response.text, 'missing query parameter');
		});
	});

	describe('with an outdated build service url and the autoinit param set to "0"', function () {
		const modules = 'o-test-component@^1.0.0';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&autoinit=0`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with an updated build service url', function () {
			// expect a release of v2 or later in the updated url
			assert.match(response.text, /components&#x3D;o-test-component@\^([2-9]|\d\d+)/);
		});

		it('should not include o-autoinit in the updated build service url', function () {
			// o-autoinit is included by default in OBS v2 but not in v3,
			// so `autoinit=0` is the default
			assert.include(response.text, 'o-autoinit');
		});
	});

	describe('with a build service url with non-existent module', function () {
		const modules = 'o-no-i-am-not-real@^1.0.0';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}%26brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with a helpful error message', function () {
			assert.match(response.text, /Could not find/);
		});
	});

	describe('with a build service url with unexpected characters', function () {
		const modules = 'o-test-component@^1.0.0,<script></script>';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}%26brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with a helpful error message', function () {
			assert.match(response.text, /unexpected/);
		});
	});
});
