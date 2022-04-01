'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v1/files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and file path are requested', function() {
		const moduleName = 'o-test-component@1.0.13';
		const pathName = 'readme.md';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v1/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should response with a year long surrogate cache control header', function() {
			// This test is not possible to run against a remote server which is behind a CDN such as Fastly because CDN's remove the Surrogate-Control header
			if (process.env.HOST) {
				this.skip();
			} else {
				assert.deepEqual(response.headers['surrogate-control'], 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000');
			}
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/files/${moduleName}/${pathName}`);
		});

	});

});

describe('GET /__origami/service/build/v1/files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and file path are requested', function() {
		const moduleName = 'o-test-component@1.0.13';
		const pathName = 'readme.md';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/v1/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should response with a year long surrogate cache control header', function() {
			// This test is not possible to run against a remote server which is behind a CDN such as Fastly because CDN's remove the Surrogate-Control header
			if (process.env.HOST) {
				this.skip();
			} else {
				assert.deepEqual(response.headers['surrogate-control'], 'public, max-age=31536000, stale-while-revalidate=31536000, stale-if-error=31536000');
			}
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/files/${moduleName}/${pathName}`);
		});

	});

});
