'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /__gtg', function () {
	this.timeout(20000);
	this.slow(5000);

	/**
	 * @type {request.Response}
	 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/__gtg')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function () {
		assert.equal(response.status, 200);
	});

	it('should respond with UTF-8 text', function () {
		assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
	});

	it('should contain OK', function () {
		assert.deepEqual(response.text, 'OK');
	});

});
