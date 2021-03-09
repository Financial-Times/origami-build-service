'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /__health', function () {
	this.timeout(20000);
	this.slow(5000);

	/**
	 * @type {request.Response}
	 */
	let response;
	before(async function () {
		response = await request(this.app)
			.get('/__health')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function () {
		assert.equal(response.status, 200);
	});

	it('should respond with UTF-8 JSON', function () {
		assert.deepEqual(response.headers['content-type'], 'application/json; charset=utf-8');
	});

	it('should contain health data', function () {
		assert.equal(response.body.schemaVersion, 1);
		assert.equal(response.body.name, 'build-service');
		assert.equal(response.body.systemCode, 'build-service');
		assert.equal(response.body.description, 'Front end build process as a service. Fetches specified Origami components from git, runs Origami build process, and returns the resulting CSS or JS bundle over HTTP.');
		assert.isAtMost(response.body.checks.length, 11);
	});

});
