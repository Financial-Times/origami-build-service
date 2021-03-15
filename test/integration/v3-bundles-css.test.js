'use strict';

const {assert} = require('chai');
const request = require('supertest');

describe('GET /v3/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid component, valid brand and valid system-code is requested', function() {
		const componentName = '@financial-times/o-test-component@v2.0.0-beta.1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.deepStrictEqual(response.status, 200);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, '.o-test-component{padding:.5em 1em;background-color:pink}.o-test-component:after{content:\'The square root of 64 is "8".\'}\n');
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/css; charset=utf-8');
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
			assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
		});
	});

	describe('when a valid component, valid system-code and invalid brand is requested', function() {
		const componentName = '@financial-times/o-test-component@v2.0.0-beta.1';
		const brand = 'origami';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "The brand query parameter must be either `master`, `internal`, or `whitelabel`."');
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

	describe('when an invalid component, valid brand and valid system-code is requested', function() {
		const componentName = '@financial-times/hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text,'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in the npm registry"');
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

	describe('when a component which is not in the @financial-times namesspace, a valid brand and a valid system-code is requested', function() {
		const componentName = 'lodash@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with the css', function() {
			assert.deepStrictEqual(response.text,'Origami Build Service returned an error: "The components query parameter can only contain components from the @financial-times namespace. Please remove the following from the components parameter: lodash."');
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
		const componentName = '@financial-times/hello-nonexistent-component@1';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text,'Origami Build Service returned an error: "@financial-times/hello-nonexistent-component@1 is not in the npm registry"');
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
		const componentName = '@financial-times/o-utils@1';
		const brand = 'master';
		const systemCode = 'origami';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
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
		const componentName = '@financial-times/o-test-component@2.0.3';
		const brand = 'master';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
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
				.get(`/v3/bundles/css?brand=${brand}&system_code=${systemCode}`)
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
				.get(`/v3/bundles/css?components[]=foo&components[]=bar&brand=${brand}&system_code=${systemCode}`)
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
				.get(`/v3/bundles/css?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
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
