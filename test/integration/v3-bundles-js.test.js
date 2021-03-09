'use strict';

const {assert} = require('chai');
const request = require('supertest');
const jsdom = require('jsdom');
const getEcmaVersion = require('detect-es-version').getEcmaVersion;
const vm = require('vm');
const sinon = require('sinon');

const { JSDOM } = jsdom;

const createWindow = () => new JSDOM('', {
	runScripts: 'dangerously'
}).window;

const executeScript = (script, givenWindow) => {
	let internalWindowError;
	const window = typeof givenWindow !== 'undefined' ? givenWindow : createWindow();

	const scriptEl = window.document.createElement('script');
	scriptEl.textContent = script;
	window.onerror = error => {
		internalWindowError = error;
		throw error;
	};
	window.document.body.appendChild(scriptEl);
	if (internalWindowError) {
		throw internalWindowError;
	}
	return window;
};

describe('GET /v3/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid component is requested', function() {
		const componentName = '@financial-times/o-test-component@2.0.0';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript', function() {
			assert.matchSnapshot(response.text);
		});

		it('should export the bundle under `Origami` global variable', function() {
			let resultWindow;
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'Origami');
			assert.property(resultWindow.Origami, '@financial-times/o-test-component');
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'application/javascript; charset=utf-8');
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
			assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
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
				.get(`/v3/bundles/js?components=${componentName}&brand=${brand}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
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
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&system_code=${systemCode}`)
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

	describe('when an invalid component is requested (JavaScript compilation error)', function() {
		const componentName = '@financial-times/o-test-component@2.0.14';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&system_code=${systemCode}`)
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
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?system_code=${systemCode}`)
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
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components[]=foo&components[]=bar&system_code=${systemCode}`)
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
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "The components query parameter contains component names which are not valid: http://1.2.3.4/."');
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

	describe('when the callback parameter is an invalid value', function() {
		const componentName = '@financial-times/o-test-component@2.0.0';
		const callback = 'console.log("you got hacked!";//';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&callback=${callback}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "The callback query parameter must be a valid name for a JavaScript variable or function."');
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

	describe('when the callback parameter is a valid value', function() {
		const componentName = '@financial-times/o-test-component@2.0.0';
		const callback = 'start_app';
		const systemCode = 'origami';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&callback=${callback}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript and call the callback with the requested components', function() {
			assert.matchSnapshot(response.text);
			assert.deepStrictEqual(getEcmaVersion(response.text), 5);

			const script = new vm.Script(response.text);

			const context = {
				start_app: sinon.spy(),
			};
			context.self = context;
			script.runInNewContext(context);
			assert.isObject(context.Origami);
			assert.isObject(context.Origami['@financial-times/o-test-component']);
			assert.isTrue(context.start_app.calledOnce);
			assert.deepStrictEqual(context.start_app.firstCall.args, [
				context.Origami
			]);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'application/javascript; charset=utf-8');
		});

		it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function() {
			assert.deepEqual(response.headers['x-content-type-options'], 'nosniff');
		});

	});

	describe('when the system_code parameter is an invalid value', function() {
		const componentName = '@financial-times/o-test-component@2.0.0';
		const systemCode = '$$origami!';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}&system_code=${systemCode}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a valid Biz-Ops System Code."');
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
	describe('when the system_code parameter is missing', function() {
		const componentName = '@financial-times/o-test-component@2.0.0';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v3/bundles/js?components=${componentName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.deepStrictEqual(response.text, 'Origami Build Service returned an error: "The system_code query parameter must be a string."');
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
