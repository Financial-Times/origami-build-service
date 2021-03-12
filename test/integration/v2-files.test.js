'use strict';

const assert = require('chai').assert;
const request = require('supertest');
const cheerio = require('cheerio');

const getErrorMessage = (text) => {
	const $ = cheerio.load(text);
	return $('[data-test-id="error-message"]').text();
};

describe('GET /v2/files', function() {
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
				.get(`/v2/files/${moduleName}/${pathName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function() {
			assert.equal(response.status, 200);
		});

		it('should respond with the expected `Content-Type` header', function() {
			assert.deepEqual(response.headers['content-type'], 'text/markdown');
		});

		it('should respond with the file contents', function() {
			assert.deepEqual(response.text, 'o-test-component\n=================\n\nThis component is used to aid in testing the Origami tooling systems.\n\n- [Usage](#usage)\n- [Contact](#contact)\n- [Licence](#licence)\n\n## Usage\n\nThis module should not be used by any teams other than Origami.\n\nEach release of this component is used to test a different scenario in the Origami services.\n\n---\n\n## Contact\n\nIf you have any questions or comments about this component, or need help using it, please either [raise an issue](https://github.com/Financial-Times/o-test-component/issues), visit [#ft-origami](https://financialtimes.slack.com/messages/ft-origami/) or email [Origami Support](mailto:origami-support@ft.com).\n\n----\n\n## Licence\n\nThis software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).\n');
		});

	});

	describe('when a valid module but invalid file path (nonexistent) are requested', function() {
		const moduleName = 'o-test-component@1';
		const pathName = 'NOTAFILE';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the path notafile does not exist in the repo/i);
		});

	});

	describe('when a valid module at specific version but, invalid file path (nonexistent) are requested', function() {
		const moduleName = 'o-test-component@1.0.0';
		const pathName = 'NOTAFILE';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 410 status', function() {
			assert.equal(response.status, 410);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /the path notafile does not exist in the repo/i);
		});

	});

	describe('when an invalid module (nonexistent) is requested', function() {
		const moduleName = 'test-404';
		const pathName = 'README.md';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function() {
			assert.equal(response.status, 404);
		});

		it('should respond with an error message', function() {
			assert.match(response.text, /package .* not found/i);
		});

	});

	describe('when an origami specification v2 component is requested', function() {
		const moduleName = 'o-test-component@2.0.0-beta.1';
		const pathName = 'main';

		/**
		 * @type {request.Response}
		 */
		let response;
		before(async function () {
			response = await request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.redirects(5)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function() {
			assert.equal(response.status, 400);
		});

		it('should respond with an error message', function() {
			assert.equal(getErrorMessage(response.text), 'o-test-component@2.0.0-beta.1 is an Origami v2 component, the Origami Build Service v2 CSS API only supports Origami v1 components.\n\nIf you want to use Origami v2 components you will need to use the Origami Build Service v3 API');
		});
	});

});
