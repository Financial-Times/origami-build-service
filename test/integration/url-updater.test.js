'use strict';

const request = require('supertest');
const proclaim = require('proclaim');
const cheerio = require('cheerio');

describe('GET /url-updater', function () {
	this.timeout(20000);
	this.slow(5000);

	const modules = 'o-test-component@^1.0.0';

	beforeEach(function () {
		this.request = request(this.app)
			.post('/url-updater')
			.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function (done) {
		this.request.expect(200).end(done);
	});

	it('should include a build service url input', function (done) {
		this.request
			.expect(({ text }) => {
				const $ = cheerio.load(text);
				const element = $('input[name="build-service-url"]');
				proclaim.ok(element.length, 'Could not find input of name "build-service-url".');
			})
			.end(done);
	});
});

describe('POST /url-updater', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('with a valid build service url', function () {
		const modules = 'o-test-component@^1.0.0';

		beforeEach(function () {
			this.request = request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function (done) {
			this.request.expect(200).end(done);
		});

		it('should respond with an updated build service url', function (done) {
			// expect a release of v2 or later in the updated url
			this.request.expect(/modules&#x3D;o-test-component@\^([2-9]|\d\d+)/).end(done);
		});
	});

	describe('with a build service url with non-existent module', function () {
		const modules = 'o-no-i-am-not-real@^1.0.0';

		beforeEach(function () {
			this.request = request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with a helpful error message', function (done) {
			this.request.expect(/Could not find/).end(done);
		});
	});

	describe('with a build service url with unexpected characters', function () {
		const modules = 'o-test-component@^1.0.0,<script></script>';

		beforeEach(function () {
			this.request = request(this.app)
				.post('/url-updater')
				.send(`build-service-url=https://www.ft.com/__origami/service/build/v2/bundles/css?modules=${modules}&brand=internal`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with a helpful error message', function (done) {
			this.request.expect(/unexpected/).end(done);
		});
	});
});
