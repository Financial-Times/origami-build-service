'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component%401.0.16';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/modules/${moduleName}`);
		});

	});

});

describe('GET /__origami/service/build/modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component%401.0.16';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/__origami/service/build/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 301 status', function() {
			assert.equal(response.status, 301);
		});

		it('should respond with a v2 `Location` header', function() {
			assert.deepEqual(response.headers['location'], `/__origami/service/build/v2/modules/${moduleName}`);
		});

	});

});
