'use strict';

const {assert} = require('chai');
const request = require('supertest');

describe('GET /v3/font', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid font is requested', function () {
		const version = '*';
		const font = 'BentonSans-Bold';
		const format = 'woff2';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});
		it('should respond with the expected `Content-Type` header', function () {
			assert.equal(response.headers['content-type'], 'font/woff2');
		});
	});

	describe('when an invalid version is requested', function () {
		const version = '1hg';
		const file = 'BentonSans-Bold.woff2';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version=${version}&file=${file}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(
				response.text,
				'"Origami Build Service returned an error: The version 1hg is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/)."'
			);


		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the font requested does not exist', function () {
		const version = '*';
		const font = 'non-existant-file';
		const format = 'magic';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(
				response.text,
				'"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."'
			);


		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the version parameter is missing', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(response.text,
				'"Origami Build Service returned an error: The version query parameter can not be empty."'
			);

		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the version parameter is not a string', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version[]=foo&version[]=bar&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(response.text,
				'"Origami Build Service returned an error: The version query parameter must be a string."'
			);

		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when a version cannot be parsed', function () {
		const version = 'http://1.2.3.4/';
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {

			assert.deepStrictEqual(						response.text,
				'"Origami Build Service returned an error: The version http://1.2.3.4/ is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/)."'
			);


		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the font_format parameter is an invalid value', function () {
		const version = '*';
		const font = 'font';
		const format = 'json';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepStrictEqual(response.text, '"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});
});

describe('GET /__origami/service/build/v3/font', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid font is requested', function () {
		const version = '*';
		const font = 'BentonSans-Bold';
		const format = 'woff2';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});
		it('should respond with the expected `Content-Type` header', function () {
			assert.equal(response.headers['content-type'], 'font/woff2');
		});
	});

	describe('when an invalid version is requested', function () {
		const version = '1hg';
		const file = 'BentonSans-Bold.woff2';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version=${version}&file=${file}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(
				response.text,
				'"Origami Build Service returned an error: The version 1hg is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/)."'
			);


		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the font requested does not exist', function () {
		const version = '*';
		const font = 'non-existant-file';
		const format = 'magic';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(
				response.text,
				'"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."'
			);


		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the version parameter is missing', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(response.text,
				'"Origami Build Service returned an error: The version query parameter can not be empty."'
			);

		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the version parameter is not a string', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version[]=foo&version[]=bar&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepEqual(response.text,
				'"Origami Build Service returned an error: The version query parameter must be a string."'
			);

		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when a version cannot be parsed', function () {
		const version = 'http://1.2.3.4/';
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {

			assert.deepStrictEqual(						response.text,
				'"Origami Build Service returned an error: The version http://1.2.3.4/ is not a valid version. Please refer to Origami Build Service v3 documentation for what is a valid version (https://www.ft.com/__origami/service/build/v3/)."'
			);


		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when the font_format parameter is an invalid value', function () {
		const version = '*';
		const font = 'font';
		const format = 'json';
		const system = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`)
				.redirects(5);
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.deepStrictEqual(response.text, '"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.equal(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});
});
