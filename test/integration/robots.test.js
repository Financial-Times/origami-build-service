'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /robots.txt', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
	 * @type {request.Response}
	 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/robots.txt')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function() {
		assert.equal(response.status, 200);
	});

	it('should respond with UTF-8 text', function() {
		assert.deepEqual(response.headers['content-type'], 'text/plain;charset=UTF-8');
	});

	it('should disallow bots hitting any path', function() {
		assert.deepEqual(response.text, 'User-Agent: *\nDisallow: /\n');
	});

});
