'use strict';

const request = require('supertest');
const {assert} = require('chai');
const cheerio = require('cheerio');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

describe('GET /v2/demos', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and demo are requested', function() {
		const moduleName = 'o-test-component@v1.0.30';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the file contents', function() {
			assert.deepEqual(response.text, '<div class="o-test-component-brand"></div>\n');
		});

	});
	describe('when a valid module and demo are requested with a valid semver range', function() {
		const moduleName = 'o-test-component@>=1.0.30 <1.0.31';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the file contents', function() {
			assert.deepEqual(response.text, '<div class="o-test-component-brand"></div>\n');
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-test-component@v1.0.30';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /not found/i);
		});

	});

	describe('when a valid module and no demo is requested, without ending /', function() {
		const moduleName = 'o-test-component@v1.0.30';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /not found/i);
		});

	});

	describe('when a valid module at specific version and demo are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the file contents', function() {
			assert.deepEqual(response.text, '<div></div>\n');
		});

	});

	describe('when a valid module at specific version and demo and brand are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html?brand=internal`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the file contents', function() {
			assert.deepEqual(response.text, '<div></div>\n');
		});

	});

	describe('when a valid module at specific version and demo which contains compilation errors are requested', function() {
		const moduleName = 'o-test-component@1.0.8';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /cannot complete build due to compilation error from build tools:/i);
		});

	});

	describe('when a valid module and non-existent demo are requested', function() {
		const moduleName = 'o-test-component@v1.0.30';
		const pathName = 'NOTADEMO';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /no demos were found for notademo/i);
		});

	});

	describe('when a valid module at specific version but non-existent demo are requested', function() {
		const moduleName = 'o-test-component@1.0.19';
		const pathName = 'NOTADEMO';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 560 status', function() {
			assert.equal(response.status, 560);
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /no demos were found for notademo/i);
		});

	});

	describe('when a valid module at non-existent version is requested', function() {
		const moduleName = 'o-test-component@99.0.0';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(getErrorMessage(response.text), /no tag found that was able to satisfy 99.0.0/i);
		});

	});

	describe('when a valid module on the main bower registry is requested', function() {
		const moduleName = 'jquery@3.0.0';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.equal(getErrorMessage(response.text), 'The modules parameter contains module names which are not on the FT bower registry: \n\t- jquery');
		});
	});

	describe('when a valid module which does not have an origami manifest is requested', function() {
		const moduleName = 'o-test-component@1.0.0';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.equal(getErrorMessage(response.text), 'The modules parameter contains module names which are not origami modules: \n\t- o-test-component');
		});
	});

	describe('when a valid module and demo are requested with a git commit hash', function () {
		const moduleName = 'o-test-component@3efec8933c0dd75b13231ce73c5336394742255b';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.equal(getErrorMessage(response.text), 'Demos may only be built for components at a valid semver version number or their latest release.');
		});
	});

	describe('when a valid module and demo are requested with an invalid semver version', function () {
		const moduleName = 'o-test-component@v1.0.0$';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function () {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function () {
			assert.equal(getErrorMessage(response.text), 'Demos may only be built for components at a valid semver version number or their latest release.');
		});
	});


	describe('when a valid module and demo are requested but the demo has invalid html', function () {
		const moduleName = 'o-video@6.1.3';
		const pathName = 'placeholder';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function () {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function () {
			assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
		});

		it('should respond with the file contents', function () {
			assert.include(response.text, 'data-o-component="o-video"');
		});
	});

	describe('when an origami component which does not follow v1 of of the specification is requested', function() {
		const moduleName = 'o-test-component@2.1.0-beta.1';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/demos/${moduleName}/${pathName}/html`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.equal(getErrorMessage(response.text), 'o-test-component@2.1.0-beta.1 is not an Origami v1 component, the Origami Build Service v2 demos API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
		});
	});

});
