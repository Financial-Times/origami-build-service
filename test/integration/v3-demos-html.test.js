'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /__origami/service/build/v3/demo/html', function() {
	this.timeout(60000);
	this.slow(5000);

	describe('when a valid component and demo are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with surrogate-key containing `demo`', function() {
			assert.deepEqual(response.headers['surrogate-key'], 'origami-build-service-demo');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component with no demos is requested', function() {
		const component = 'o-test-component@2.2.7';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.7 has no demos defined within it\'s origami.json file. See the component specification for details on how to configure demos for a component: https://origami.ft.com/spec/"');
		});

	});

	describe('when a valid component at specific version and demo are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component at specific version and demo and brand are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'internal';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component at specific version and demo which contains mustache compilation errors are requested', function() {
		const component = 'o-test-component@2.2.10';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.10\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Mustache templates: Unclosed section \\"causing-syntax-error-by-not-closing-section\\"');
		});

	});

	describe('when a valid component at specific version and demo which contains sass compilation errors are requested', function() {
		const component = 'o-test-component@2.2.11';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			const body = response.text;
			assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.11\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Sass: Error: ');
		});

	});

	describe('when a valid component at specific version and demo which contains javascript compilation errors are requested', function() {
		const component = 'o-test-component@2.2.12';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			const body = response.text;
			assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.12\'s demo named \\"test-demo\\" could not be built due to a compilation error within the JavaScript: ');
		});

	});

	describe('when a valid component and non-existent demo are requested', function() {
		const component = 'o-test-component@v2.2.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@v2.2.1 has no demo with the requested name: NOTADEMO"');
		});

	});

	describe('when a valid component at specific version but non-existent demo are requested', function() {
		const component = 'o-test-component@2.2.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.1 has no demo with the requested name: NOTADEMO"');
		});

	});

	describe('when a valid component at non-existent version is requested', function() {
		const component = 'o-test-component@99.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@99.0.0 is not in this registry"');
		});

	});

	describe('when a non origami component is requested', function() {
		const component = 'jquery@3.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/jquery@3.0.0 is not in this registry"');
		});
	});

	describe('when a valid component which does not have an origami manifest is requested', function() {
		const component = 'o-test-component@2.2.13';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.13 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."');
		});
	});

	describe('when an origami specification v1 component is requested', function() {
		const component = 'o-test-component@1.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@1.0.0 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
			;
		});
	});

	describe('when the request is missing the brand parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'The brand query parameter must be a string');
		});
	});
	describe('when the request contains an invalid brand parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'denshiba';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'The brand query parameter must be either')
			;
		});
	});
	describe('when the request is missing the demo parameter', function() {
		const component = 'o-test-component@2.2.9';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The demo query parameter must be a string."')
			;
		});
	});
	describe('when the request contains an invalid demo parameter', function() {
		const component = 'o-test-component@2.2.9';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo[]=foo&demo[]=bar&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The demo query parameter must be a string."')
			;
		});
	});
	describe('when the request is missing the system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a string."')
			;
		});
	});
	describe('when the request contains a placeholder system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = '$$$-no-bizops-system-code-$$$';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});
	describe('when the request contains an invalid system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'not_a_system_code_137';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."')
			;
		});
	});
	describe('when the request is missing the component parameter', function() {
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The component query parameter must be a string."')
			;
		});
	});
	describe('when the request contains an invalid component parameter', function() {
		const component = 'not:a^valid@component';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The component query parameter contains component names which are not valid: not:a^valid."')
			;
		});
	});

	describe('when a valid component at specific version and demo which contains html syntax errors are requested', function() {
		const component = 'o-test-component@2.2.15';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'Origami Build Service returned an error: "The HTML in the demo contains syntax errors.');
		});

	});

});

describe('GET /__origami/service/build/v3/demo/html', function() {
	this.timeout(60000);
	this.slow(5000);

	describe('when a valid component and demo are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component with no demos is requested', function() {
		const component = 'o-test-component@2.2.7';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.7 has no demos defined within it\'s origami.json file. See the component specification for details on how to configure demos for a component: https://origami.ft.com/spec/"');
		});

	});

	describe('when a valid component at specific version and demo are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component at specific version and demo and brand are requested', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'internal';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the demo html contents', function() {
			assert.deepEqual(response.text, '<div data-o-component="o-test-component" class="o-test-component"></div>');
		});

	});

	describe('when a valid component at specific version and demo which contains mustache compilation errors are requested', function() {
		const component = 'o-test-component@2.2.10';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.10\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Mustache templates: Unclosed section \\"causing-syntax-error-by-not-closing-section\\"');
		});

	});

	describe('when a valid component at specific version and demo which contains sass compilation errors are requested', function() {
		const component = 'o-test-component@2.2.11';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			const body = response.text;
			assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.11\'s demo named \\"test-demo\\" could not be built due to a compilation error within the Sass: Error: ');
		});

	});

	describe('when a valid component at specific version and demo which contains javascript compilation errors are requested', function() {
		const component = 'o-test-component@2.2.12';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function() {
				assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
				assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
			});
		});

		it('should respond with an error message', function() {
			const body = response.text;
			assert.include(body, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.12\'s demo named \\"test-demo\\" could not be built due to a compilation error within the JavaScript: ');
		});

	});

	describe('when a valid component and non-existent demo are requested', function() {
		const component = 'o-test-component@v2.2.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@v2.2.1 has no demo with the requested name: NOTADEMO"');
		});

	});

	describe('when a valid component at specific version but non-existent demo are requested', function() {
		const component = 'o-test-component@2.2.1';
		const demo = 'NOTADEMO';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.1 has no demo with the requested name: NOTADEMO"');
		});

	});

	describe('when a valid component at non-existent version is requested', function() {
		const component = 'o-test-component@99.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@99.0.0 is not in this registry"');
		});

	});

	describe('when a non origami component is requested', function() {
		const component = 'jquery@3.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/jquery@3.0.0 is not in this registry"');
		});
	});

	describe('when a valid component which does not have an origami manifest is requested', function() {
		const component = 'o-test-component@2.2.13';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@2.2.13 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."');
		});
	});

	describe('when an origami specification v1 component is requested', function() {
		const component = 'o-test-component@1.0.0';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "@financial-times/o-test-component@1.0.0 is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components."')
			;
		});
	});

	describe('when the request is missing the brand parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'The brand query parameter must be a string');
		});
	});
	describe('when the request contains an invalid brand parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'denshiba';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'The brand query parameter must be either')
			;
		});
	});
	describe('when the request is missing the demo parameter', function() {
		const component = 'o-test-component@2.2.9';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The demo query parameter must be a string."')
			;
		});
	});
	describe('when the request contains an invalid demo parameter', function() {
		const component = 'o-test-component@2.2.9';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo[]=foo&demo[]=bar&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The demo query parameter must be a string."')
			;
		});
	});
	describe('when the request is missing the system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a string."')
			;
		});
	});
	describe('when the request contains a placeholder system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = '$$$-no-bizops-system-code-$$$';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});
	describe('when the request contains an invalid system_code parameter', function() {
		const component = 'o-test-component@2.2.9';
		const demo = 'test-demo';
		const system_code = 'not_a_system_code_137';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."')
			;
		});
	});
	describe('when the request is missing the component parameter', function() {
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The component query parameter must be a string."')
			;
		});
	});
	describe('when the request contains an invalid component parameter', function() {
		const component = 'not:a^valid@component';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepEqual(response.text, 'Origami Build Service returned an error: "The component query parameter contains component names which are not valid: not:a^valid."')
			;
		});
	});

	describe('when a valid component at specific version and demo which contains html syntax errors are requested', function() {
		const component = 'o-test-component@2.2.15';
		const demo = 'test-demo';
		const system_code = 'origami';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v3/demo/html?component=${component}&demo=${demo}&system_code=${system_code}&brand=${brand}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.include(response.text, 'Origami Build Service returned an error: "The HTML in the demo contains syntax errors.');
		});

	});

});
