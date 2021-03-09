'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /v2', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/v2')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function() {
		assert.equal(response.status, 200);
	});

	it('should respond with HTML', function() {
		assert.deepEqual(response.headers['content-type'], 'text/html; charset=utf-8');
	});

	it('should respond with the build service documentation', function() {
		assert.match(response.text, /origami build service/i);
	});

});
