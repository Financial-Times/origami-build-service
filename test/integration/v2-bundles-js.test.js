'use strict';

const {assert} = require('chai');
const request = require('supertest');
const jsdom = require('jsdom');
const sinon = require('sinon');
const cheerio = require('cheerio');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

const CORE_JS_GLOBAL_PROPERTY = '__core-js_shared__';

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

describe('GET /v2/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript', function() {
			assert.match(response.text, /^\/\*\* Shrinkwrap URL:\n \*/);
			assert.doesNotThrow(() => executeScript(response.text));
		});

		it('should minify the bundle', function() {
			assert.notInclude(response.text, '// unminified');
		});

		it('should export the bundle under `window.Origami`', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'Origami');
			assert.property(resultWindow.Origami, moduleName.split('@')[0]);
		});

	});

	describe('when a valid module is requested with a shrinkwrap url', function() {
		// Uses a real example which users may have in production,
		// it is a less common example which includes a github url as a
		// shrinkwrap dependency:
		const moduleName = 'o-gallery@4.0.9';
		const modulesParam = `${moduleName}%2Co-autoinit%401.5.1`;
		const shrinkwrapParam = 'ftdomdelegate%404.0.6%2Cfticons%401.23.1%2Chttps%3A%2F%2Fgithub.com%2Fftlabs%2Fftscroller.git%2Cmathsass%400.10.1%2Co-assets%403.4.9%2Co-brand%403.3.0%2Co-colors%405.3.1%2Co-icons%406.3.0%2Co-utils%401.1.7%2Co-viewport%404.0.5';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${modulesParam}&shrinkwrap=${shrinkwrapParam}&brand=master`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when a valid module is requested (with the `minify` parameter set to `none`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript unminified', function() {
			assert.match(response.text, / sourceMappingURL=data:application\/json;charset=utf-8;base64,/i);
		});

	});

	describe('when a valid module is requested (with the `autoinit` parameter set to `0`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&autoinit=0`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript without the o-autoinit module', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'Origami');
			assert.notProperty(resultWindow.Origami, 'o-autoinit');
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to `foo`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=foo`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should export the bundle under `window.foo`', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'foo');
			assert.property(resultWindow.foo, moduleName.split('@')[0]);
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to an empty string)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should not export the bundle onto `window`', function() {
			const givenWindow = createWindow();
			Object.defineProperty(givenWindow, 'Origami', { set() {
				throw new Error('Attempted to set Origami property on window');
			} });
			assert.doesNotThrow(() => executeScript(response.text, givenWindow));
			assert.notProperty(givenWindow, 'Origimi');
		});

	});

	describe('when a valid module is requested (with the `callback` parameter set to a non-empty string)', function() {
		const moduleName = 'o-test-component@1.0.2';
		const givenCallback = 'page.load.deep';

		const makeRequest = function(callback) {
			const now = new Date().toISOString();
			return request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&callback=${callback}`)
				.redirects(5)
				.set('Connection', 'close');
		};

		it('should respond with a 200 status', function() {
			makeRequest.call(this, givenCallback)
				.expect(200)
			;
		});

		it('should include the given callback parameter, executed with the bundle context', function() {
			const givenWindow = createWindow();
			givenWindow.page = {
				load: {
					deep: sinon.stub()
				}
			};
			makeRequest.call(this, givenCallback)
				.expect(({text}) => {
					assert.doesNotThrow(() => executeScript(text, givenWindow));
					assert.property(givenWindow.page.load.deep.getCall(0).args[0], moduleName.split('@')[0]);
				})
			;
		});

		[';my.Function', 'my.function;other'].forEach((callback) => {
			it(`should call the callback if it is '${callback}' and does not match the pattern ^[\\w\\.]+$`, function() {
				const givenWindow = createWindow();
				givenWindow.page = {
					load: {
						deep: sinon.stub()
					}
				};
				makeRequest.call(this, callback)
					.expect(({text}) => {
						assert.doesNotThrow(() => executeScript(text, givenWindow));
						assert.isTrue(givenWindow.page.load.deep.notCalled, 'Callback was called unexpectedly');
					})
				;
			});
		});
	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `none`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=none&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript with no polyfills', function() {
			let resultWindow;
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.notProperty(resultWindow, CORE_JS_GLOBAL_PROPERTY);
		});

	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `true`)', function() {
		/**
         * We need to request a module which uses features which will trigger Babel to include the polyfill set.
         */
		const moduleName = 'o-test-component@1.0.16';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=true&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript containing polyfills', function() {
			let resultWindow;
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, CORE_JS_GLOBAL_PROPERTY);
		});

	});

	describe('when an invalid module is requested (JavaScript compilation error)', function() {
		const moduleName = 'o-test-component@1.0.1';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /cannot complete build due to compilation error from build tools:/i);
		});

	});

	describe('when the modules parameter is missing', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/v2/bundles/js')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the modules parameter is required and must be a comma-separated list of modules/i);
		});

	});

	describe('when the module requested isn\'t on the allow list', function() {

		const moduleName = 'evil-code';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.match(response.text, /An unrecognised component, &quot;evil-code&quot;, was included in the module parameter./i);
		});

	});

	describe('when the shrinkwrap param includes a module which isn\'t on the allow list', function() {

		const moduleName = 'o-test-component';
		const shrinkwrapParameter = 'malicious-person/evil-code<script></script>#';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&shrinkwrap=${shrinkwrapParameter}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with a html escaped error message', function () {
			assert.match(response.text, /&quot;malicious-person\/evil-code&lt;script&gt;&lt;\/script&gt;&quot;/i);
		});

	});

	describe('when the modules parameter is not a string', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/v2/bundles/js?modules[]=foo&modules[]=bar')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the modules parameter is required and must be a comma-separated list of modules/i);
		});

	});

	describe('when a module name cannot be parsed', function() {
		const moduleName = 'http://1.2.3.4/';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /The modules parameter contains module names which are not valid: http:\/\/1.2.3.4\//i);
		});

	});

	describe('when the bundle type is invalid', function() {
		const moduleName = 'o-test-component@1.0.11';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/javascript?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

	});

});

describe('when a module name is a relative directory', function() {
	const moduleName = '../../../example';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		const now = (new Date()).toISOString();
		response = await request(this.app)
			.get(`/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message ', function() {
		assert.match(response.text, /The modules parameter contains module names which are not valid: \.\.\/\.\.\/\.\.\/example/i);
	});

});

describe('export parameter as xss attack vector', function() {
	const moduleName = 'o-test-component@1.0.16';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get(`/v2/bundles/js?modules=${moduleName}&export='];alert('oops')//`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message ', function() {
		assert.match(response.text, /The export parameter can only contain underscore, period, and alphanumeric characters. The export parameter given was: &#x27;];alert\(&#x27;oops&#x27;\)\/\//);
	});

	it('should respond with HTML', function() {
		assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
	});
});

describe('when an origami component which does not follow v1 of of the specification is requested', function() {
	const moduleName = 'o-test-component@2.1.0-beta.1';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get(`/v2/bundles/js?modules=${moduleName}`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message', function() {
		assert.equal(getErrorMessage(response.text), 'o-test-component@2.1.0-beta.1 is not an Origami v1 component, the Origami Build Service v2 JS bundle API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
	});
});

describe('GET /__origami/service/build/v2/bundles/js', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript', function() {
			assert.match(response.text, /^\/\*\* Shrinkwrap URL:\n \*/);
			assert.doesNotThrow(() => executeScript(response.text));
		});

		it('should minify the bundle', function() {
			assert.notInclude(response.text, '// unminified');
		});

		it('should export the bundle under `window.Origami`', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'Origami');
			assert.property(resultWindow.Origami, moduleName.split('@')[0]);
		});

	});

	describe('when a valid module is requested with a shrinkwrap url', function() {
		// Uses a real example which users may have in production,
		// it is a less common example which includes a github url as a
		// shrinkwrap dependency:
		const moduleName = 'o-gallery@4.0.9';
		const modulesParam = `${moduleName}%2Co-autoinit%401.5.1`;
		const shrinkwrapParam = 'ftdomdelegate%404.0.6%2Cfticons%401.23.1%2Chttps%3A%2F%2Fgithub.com%2Fftlabs%2Fftscroller.git%2Cmathsass%400.10.1%2Co-assets%403.4.9%2Co-brand%403.3.0%2Co-colors%405.3.1%2Co-icons%406.3.0%2Co-utils%401.1.7%2Co-viewport%404.0.5';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${modulesParam}&shrinkwrap=${shrinkwrapParam}&brand=master`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when a valid module is requested (with the `minify` parameter set to `none`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript unminified', function() {
			assert.match(response.text, / sourceMappingURL=data:application\/json;charset=utf-8;base64,/i);
		});

	});

	describe('when a valid module is requested (with the `autoinit` parameter set to `0`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&autoinit=0`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript without the o-autoinit module', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'Origami');
			assert.notProperty(resultWindow.Origami, 'o-autoinit');
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to `foo`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=foo`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should export the bundle under `window.foo`', function() {
			let resultWindow = {};
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, 'foo');
			assert.property(resultWindow.foo, moduleName.split('@')[0]);
		});

	});

	describe('when a valid module is requested (with the `export` parameter set to an empty string)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&export=`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should not export the bundle onto `window`', function() {
			const givenWindow = createWindow();
			Object.defineProperty(givenWindow, 'Origami', { set() {
				throw new Error('Attempted to set Origami property on window');
			} });
			assert.doesNotThrow(() => executeScript(response.text, givenWindow));
			assert.notProperty(givenWindow, 'Origimi');
		});

	});

	describe('when a valid module is requested (with the `callback` parameter set to a non-empty string)', function() {
		const moduleName = 'o-test-component@1.0.2';
		const givenCallback = 'page.load.deep';

		const makeRequest = function(callback) {
			const now = new Date().toISOString();
			return request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&callback=${callback}`)
				.redirects(5)
				.set('Connection', 'close');
		};

		it('should respond with a 200 status', function() {
			makeRequest.call(this, givenCallback)
				.expect(200)
			;
		});

		it('should include the given callback parameter, executed with the bundle context', function() {
			const givenWindow = createWindow();
			givenWindow.page = {
				load: {
					deep: sinon.stub()
				}
			};
			makeRequest.call(this, givenCallback)
				.expect(({text}) => {
					assert.doesNotThrow(() => executeScript(text, givenWindow));
					assert.property(givenWindow.page.load.deep.getCall(0).args[0], moduleName.split('@')[0]);
				})
			;
		});

		[';my.Function', 'my.function;other'].forEach((callback) => {
			it(`should call the callback if it is '${callback}' and does not match the pattern ^[\\w\\.]+$`, function() {
				const givenWindow = createWindow();
				givenWindow.page = {
					load: {
						deep: sinon.stub()
					}
				};
				makeRequest.call(this, callback)
					.expect(({text}) => {
						assert.doesNotThrow(() => executeScript(text, givenWindow));
						assert.isTrue(givenWindow.page.load.deep.notCalled, 'Callback was called unexpectedly');
					})
				;
			});
		});
	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `none`)', function() {
		const moduleName = 'o-test-component@1.0.2';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=none&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript with no polyfills', function() {
			let resultWindow;
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.notProperty(resultWindow, CORE_JS_GLOBAL_PROPERTY);
		});

	});

	describe('when a valid module is requested (with the `polyfills` parameter set to `true`)', function() {
		/**
         * We need to request a module which uses features which will trigger Babel to include the polyfill set.
         */
		const moduleName = 'o-test-component@1.0.16';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}&polyfills=true&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled JavaScript containing polyfills', function() {
			let resultWindow;
			assert.doesNotThrow(() => {
				resultWindow = executeScript(response.text);
			});
			assert.property(resultWindow, CORE_JS_GLOBAL_PROPERTY);
		});

	});

	describe('when an invalid module is requested (JavaScript compilation error)', function() {
		const moduleName = 'o-test-component@1.0.1';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /cannot complete build due to compilation error from build tools:/i);
		});

	});

	describe('when the modules parameter is missing', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/__origami/service/build/v2/bundles/js')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the modules parameter is required and must be a comma-separated list of modules/i);
		});

	});

	describe('when the module requested isn\'t on the allow list', function() {

		const moduleName = 'evil-code';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.match(response.text, /An unrecognised component, &quot;evil-code&quot;, was included in the module parameter./i);
		});

	});

	describe('when the shrinkwrap param includes a module which isn\'t on the allow list', function() {

		const moduleName = 'o-test-component';
		const shrinkwrapParameter = 'malicious-person/evil-code<script></script>#';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&shrinkwrap=${shrinkwrapParameter}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with a html escaped error message', function () {
			assert.match(response.text, /&quot;malicious-person\/evil-code&lt;script&gt;&lt;\/script&gt;&quot;/i);
		});

	});

	describe('when the modules parameter is not a string', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/__origami/service/build/v2/bundles/js?modules[]=foo&modules[]=bar')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the modules parameter is required and must be a comma-separated list of modules/i);
		});

	});

	describe('when a module name cannot be parsed', function() {
		const moduleName = 'http://1.2.3.4/';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /The modules parameter contains module names which are not valid: http:\/\/1.2.3.4\//i);
		});

	});

	describe('when the bundle type is invalid', function() {
		const moduleName = 'o-test-component@1.0.11';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/javascript?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

	});

});

describe('when a module name is a relative directory', function() {
	const moduleName = '../../../example';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		const now = (new Date()).toISOString();
		response = await request(this.app)
			.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&newerthan=${now}`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message ', function() {
		assert.match(response.text, /The modules parameter contains module names which are not valid: \.\.\/\.\.\/\.\.\/example/i);
	});

});

describe('export parameter as xss attack vector', function() {
	const moduleName = 'o-test-component@1.0.16';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}&export='];alert('oops')//`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message ', function() {
		assert.match(response.text, /The export parameter can only contain underscore, period, and alphanumeric characters. The export parameter given was: &#x27;];alert\(&#x27;oops&#x27;\)\/\//);
	});

	it('should respond with HTML', function() {
		assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
	});
});

describe('when an origami component which does not follow v1 of of the specification is requested', function() {
	const moduleName = 'o-test-component@2.1.0-beta.1';

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get(`/__origami/service/build/v2/bundles/js?modules=${moduleName}`)
			.redirects(5)
			.set('Connection', 'close');
	});

	it('should respond with a 400 status', function() {
		assert.equal(response.status, 400);
	});

	it('should respond with an error message', function() {
		assert.equal(getErrorMessage(response.text), 'o-test-component@2.1.0-beta.1 is not an Origami v1 component, the Origami Build Service v2 JS bundle API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
	});
});
