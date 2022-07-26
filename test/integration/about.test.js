'use strict';

const request = require('supertest');
const {assert} = require('chai');

describe('GET /__about', function () {
	this.timeout(20000);
	this.slow(5000);
	/**
	 * @type {request.Response}
	 */
	let response;
	before(async function () {
		response = await request(this.app).get('/__about');
	});

	it('should respond with a 200 status', function () {
		assert.equal(response.status, 200);
	});

	it('should respond with UTF-8 JSON', function () {
		assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
	});

	it('should contain about data', function () {
		const aboutInfo = Object.assign({}, require('../../about.json'));
		// we have to remove the dateDeployed key as it doesn't match
		delete response.body.dateDeployed;
		delete aboutInfo.dateDeployed;
		// we have to remove the appVersion and _hostname as they will be different when running the tests against remote servers.
		delete response.body.appVersion;
		delete response.body._hostname;
		delete aboutInfo.appVersion;
		delete aboutInfo._hostname;

		assert.isObject(response.body);
		assert.deepEqual(response.body, aboutInfo);
	});

});
