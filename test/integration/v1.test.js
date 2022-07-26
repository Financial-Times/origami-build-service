'use strict';

const {assert} = require('chai');
const request = require('supertest');

describe('GET /__origami/service/build/v1', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/__origami/service/build/v1')
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

	it('should respond with HTML', function() {
		assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
	});

});

describe('GET /__origami/service/build/v1', function() {
	this.timeout(20000);
	this.slow(5000);

	/**
		 * @type {request.Response}
		 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/__origami/service/build/v1')
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

	it('should respond with HTML', function() {
		assert.deepEqual(response.headers['content-type'], 'text/plain; charset=utf-8');
	});

});
