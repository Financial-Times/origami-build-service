'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /files', function() {
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
				.get(`/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/files/${moduleName}/${pathName}`);
		});

	});

});

describe('GET /__origami/service/build/files', function() {
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
				.get(`/__origami/service/build/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/files/${moduleName}/${pathName}`);
		});

	});

});
