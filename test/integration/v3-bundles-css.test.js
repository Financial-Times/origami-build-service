'use strict';

const {assert} = require('chai');
const request = require('supertest');

describe('GET /__origami/service/build/v3/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid component, valid brand and valid system-code is requested', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.deepStrictEqual(response.status, 200);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, '.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello world!  The square root of 64 is "8".\'}\n');
		});

		it('should respond with surrogate-key containing `css`', function() {
			assert.deepEqual(response.headers['surrogate-key'], 'origami-build-service-v3-css');
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/css; charset=utf-8');
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
			assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
		});
	});

	describe('when a valid component, valid system-code and invalid brand is requested', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'origami';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.include(response.text, '"The brand query parameter must be either');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when a valid "core" brand component is requested with a deprecated "master" brand query parameter value', function() {
		const componentName = 'o-layout@5.0.6';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when a valid "master" brand component is requested with the replacement "core" brand query parameter value', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'core';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when an invalid component, valid brand and valid system-code is requested', function() {
		const componentName = 'hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in this registry"');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when an invalid component is requested (nonexistent)', function() {
		const componentName = 'hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text,'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in this registry"');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when an invalid component is requested (origami v1)', function() {
		const componentName = 'o-utils@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				assert.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

	});

	describe('when an invalid component is requested (origami v3)', function() {
		const componentName = 'o3-utils@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				assert.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

	});

	describe('when an invalid component is requested (Sass compilation error)', function() {
		const componentName = 'o-test-component@2.2.3';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /Origami Build Service returned an error: /);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when the components parameter is missing', function() {
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter can not be empty."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when the components parameter is not a string', function() {
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components[]=foo&components[]=bar&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter must be a string."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when a component name cannot be parsed', function() {
		const componentName = 'http://1.2.3.4/';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter contains component names which are not valid: http://1.2.3.4/."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

});

describe('GET /__origami/service/build/v3/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid component, valid brand and valid system-code is requested', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.deepStrictEqual(response.status, 200);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, '.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'Hello world!  The square root of 64 is "8".\'}\n');
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/css; charset=utf-8');
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
			assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
		});
	});

	describe('when a valid component, valid system-code and invalid brand is requested', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'origami';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.include(response.text, '"The brand query parameter must be either');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when a valid "core" brand component is requested with a deprecated "master" brand query parameter value', function() {
		const componentName = 'o-layout@5.0.6';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when a valid "master" brand component is requested with the replacement "core" brand query parameter value', function() {
		const componentName = 'o-test-component@v2.2.9';
		const brand = 'core';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when an invalid component, valid brand and valid system-code is requested', function() {
		const componentName = 'hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in this registry"');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});
	});

	describe('when an invalid component is requested (nonexistent)', function() {
		const componentName = 'hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text,'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in this registry"');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when an invalid component is requested (origami v1)', function() {
		const componentName = 'o-utils@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function(done) {
			this.request.expect(response => {
				assert.deepStrictEqual(response.status, 400);
			}).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});

	});

	describe('when an invalid component is requested (Sass compilation error)', function() {
		const componentName = 'o-test-component@2.2.3';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /Origami Build Service returned an error: /);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when the components parameter is missing', function() {
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter can not be empty."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when the components parameter is not a string', function() {
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components[]=foo&components[]=bar&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter must be a string."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

	describe('when a component name cannot be parsed', function() {
		const componentName = 'http://1.2.3.4/';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The components query parameter contains component names which are not valid: http://1.2.3.4/."');
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

	});

});
