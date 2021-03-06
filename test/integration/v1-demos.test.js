'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v1/demos', function() {
	this.timeout(40400);
	this.slow(5000);

	describe('when a valid module and demo are requested', function() {
		const moduleName = 'o-test-component';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-test-component';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}/`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

	describe('when a valid module and no demo is requested, without ending /', function() {
		const moduleName = 'o-test-component';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
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
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

	describe('when a valid module and non-existent demo are requested', function() {
		const moduleName = 'o-test-component';
		const pathName = 'NOTADEMO';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
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
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

	describe('when an non-existent module is requested', function() {
		const moduleName = 'non-existent-module';
		const pathName = 'README.md';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

	describe('when an invalid module (non-existent) at specific version is requested', function() {
		const moduleName = 'non-existent-module@1.0.0';
		const pathName = 'README.md';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
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
				.get(`/v1/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /not found/i);
		});

	});

});
