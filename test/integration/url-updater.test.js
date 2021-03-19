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
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with an updated build service url', function () {
			// expect a release of v2 or later in the updated url
			assert.match(response.text, /modules&#x3D;o-test-component@\^([2-9]|\d\d+)/);
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
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
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
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
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
