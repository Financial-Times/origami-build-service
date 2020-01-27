'use strict';

const assert = require('chai').assert;
const request = require('supertest');

describe('GET /v2/modules', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = 'o-test-component%401.0.16';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with JSON', function(done) {
			this.request.expect('Content-Type', 'application/json;charset=UTF-8').end(done);
		});

		it('should respond with the module information', function(done) {
			this.request.end((error, response) => {
				const json = JSON.parse(response.text);
				assert.strictEqual(json.build.bundler.valid, true, 'Expected bundle to be valid');
				assert.strictEqual(json.build.js.valid, true, 'Expected JS to be valid');
				assert.strictEqual(json.build.css.valid, true, 'Expected CSS to be valid');
				assert.strictEqual(json.bowerEndpoint, 'o-test-component=o-test-component#1.0.16');
				assert.strictEqual(json.bowerManifest.name, 'test-component');
				assert.strictEqual(json.readme, 'o-test-component\n=================\n\nThis component is used to aid in testing the Origami tooling systems.\n\n- [Usage](#usage)\n- [Contact](#contact)\n- [Licence](#licence)\n\n## Usage\n\nThis module should not be used by any teams other than Origami.\n\nEach release of this component is used to test a different scenario in the Origami services.\n\n---\n\n## Contact\n\nIf you have any questions or comments about this component, or need help using it, please either [raise an issue](https://github.com/Financial-Times/o-test-component/issues), visit [#origami-support](https://financialtimes.slack.com/messages/origami-support/) or email [Origami Support](mailto:origami-support@ft.com).\n\n----\n\n## Licence\n\nThis software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).\n');
				done();
			});
		});

	});

	describe('when an invalid module is requested (nonexistent)', function() {
		const moduleName = 'test-404';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message', function(done) {
			this.request.expect(/package .* not found/i).end(done);
		});

	});

	describe('when an invalid module is requested (Sass/JavaScript compilation errors)', function() {
		const moduleName = 'o-test-component@1.0.1';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/modules/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with JSON', function(done) {
			this.request.expect('Content-Type', 'application/json;charset=UTF-8').end(done);
		});

		it('should respond with the module information', function(done) {
			this.request.end((error, response) => {
				const json = JSON.parse(response.text);
				assert.strictEqual(json.build.bundler.valid, true, 'Expected bundle to be valid');
				assert.strictEqual(json.build.js.valid, false, 'Expected JS to be invalid');
				assert.strictEqual(json.build.css.valid, true, 'Expected CSS to be valid');
				assert.strictEqual(json.bowerEndpoint, 'o-test-component=o-test-component#1.0.1');
				assert.strictEqual(json.bowerManifest.name, 'test-component');
				done();
			});
		});

	});

});
