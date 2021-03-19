'use strict';

const request = require('supertest');
const cheerio = require('cheerio');
const {assert} = require('chai');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

describe('GET /v2/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component@1.0.4';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled CSS', function() {
			assert.deepEqual(response.text, '/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=o-test-component%401.0.4%2Co-autoinit%401.5.1&shrinkwrap=&brand=master\n */\n#test-compile-error{color:red}');
		});

		it('should minify the bundle', function() {
			assert.notInclude(response.text, '/* unminified */');
		});

	});

	describe('when a valid module is requested (with no minification)', function() {
		const moduleName = 'o-test-component@1.0.4';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&minify=none`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the bundled CSS unminified', function() {
			assert.deepEqual(response.text, '/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=o-test-component%401.0.4%2Co-autoinit%401.5.1&shrinkwrap=&brand=master\n */\n#test-compile-error {\n  color: red; }\n\n/*# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvd2VyX2NvbXBvbmVudHMvby10ZXN0LWNvbXBvbmVudC9tYWluLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFDQyxXQUFVLEVBQ1YiLCJmaWxlIjoibWFpbi07LW1hc3Rlci5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcbiN0ZXN0LWNvbXBpbGUtZXJyb3Ige1xuXHRjb2xvcjogcmVkO1xufVxuIl19 */\n');
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'test-404';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message ', function() {
			assert.match(response.text, /package .* not found/i);
		});

	});

	describe('when an invalid module is requested (Sass compilation error)', function() {
		const moduleName = 'o-test-component@1.0.3';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message ', function() {
			assert.match(response.text, /cannot complete build due to compilation error from build tools:/i);
		});

	});

	describe('when a branded module is requested for a brand it does not support', function() {
		const moduleName = 'o-layout@3.0.0';
		const brand = 'master';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message ', function() {
			assert.match(response.text, /o-layout does not support the master brand/i);
		});

	});

	describe('when a branded module is requested for a supported brand', function() {
		const moduleName = 'o-layout@3.0.0';
		const brand = 'internal';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&brand=${brand}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});
	});

	describe('when a module is requested with an invalid source param', function () {
		const moduleName = 'o-layout@3.0.0';
		const source = '^%^^£%$&@';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&source=${source}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message ', function () {
			assert.match(response.text, /must be a valid system code/i);
		});

	});

	describe('when a module is requested for a valid source param', function () {
		const moduleName = 'o-test-component@v1.0.34';
		const source = 'test-source';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			const now = (new Date()).toISOString();
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}&source=${source}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with css for the given source', function () {
			assert.deepEqual(response.text, `/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=o-test-component%401.0.34%2Co-autoinit%401.5.1&shrinkwrap=&brand=master\n */\n.o-test-component{content:"${source}"}`);
		});
	});

	describe('when the modules parameter is missing', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/v2/bundles/css')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message ', function() {
			assert.match(response.text, /the modules parameter is required and must be a comma-separated list of modules/i);
		});

	});

	describe('when the modules parameter is not a string', function() {

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get('/v2/bundles/css?modules[]=foo&modules[]=bar')
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message ', function() {
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
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message ', function() {
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
				.get(`/v2/bundles/CSS?modules=${moduleName}&newerthan=${now}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

	});

	describe('when an origami specification v2 component is requested', function() {
		const moduleName = 'o-test-component@2.0.0-beta.1';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.equal(getErrorMessage(response.text), 'o-test-component@2.0.0-beta.1 is not an Origami v1 component, the Origami Build Service v2 CSS bundle API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
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
			.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
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
