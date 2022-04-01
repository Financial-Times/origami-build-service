'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/')
			.set('Connection', 'close');
	});

	it('should respond with a 301 status', function() {
		assert.equal(response.status, 301);
	});

	it('should respond with a v3 `Location` header', function() {
		assert.deepEqual(response.headers['location'], '/__origami/service/build/v3/');
	});

	it('should respond with plaintext', function() {
		assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
	});

});

describe('GET /__origami/service/build/', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/__origami/service/build/')
			.set('Connection', 'close');
	});

	it('should respond with a 301 status', function() {
		assert.equal(response.status, 301);
	});

	it('should respond with a v3 `Location` header', function() {
		assert.deepEqual(response.headers['location'], '/__origami/service/build/v3/');
	});

	it('should respond with plaintext', function() {
		assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
	});

});
