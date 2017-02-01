'use strict';

const request = require('supertest');

describe('GET /v2/files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and file path are requested', function() {
		const moduleName = 'o-test-component@1.0.13';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/x-markdown').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('o-test-component\n=================\n\nThis component is used to aid in testing the Origami tooling systems.\n\n- [Usage](#usage)\n- [Contact](#contact)\n- [Licence](#licence)\n\n## Usage\n\nThis module should not be used by any teams other than Origami.\n\nEach release of this component is used to test a different scenario in the Origami services.\n\n---\n\n## Contact\n\nIf you have any questions or comments about this component, or need help using it, please either [raise an issue](https://github.com/Financial-Times/o-test-component/issues), visit [#ft-origami](https://financialtimes.slack.com/messages/ft-origami/) or email [Origami Support](mailto:origami-support@ft.com).\n\n----\n\n## Licence\n\nThis software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).\n').end(done);
		});

	});

	describe('when a valid module but invalid file path (nonexistent) are requested', function() {
		const moduleName = 'o-test-component';
		const pathName = 'NOTAFILE';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nThe path NOTAFILE does not exist in the repo\n\n*/\n').end(done);
		});

	});

	describe('when a valid module at specific version but, invalid file path (nonexistent) are requested', function() {
		const moduleName = 'o-test-component@1.0.0';
		const pathName = 'NOTAFILE';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 410 status', function(done) {
			this.request.expect(410).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('/*\n\nThe path NOTAFILE does not exist in the repo\n\n*/\n').end(done);
		});

	});

	describe('when an invalid module (nonexistent) is requested', function() {
		const moduleName = 'test-404';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/v2/files/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect(/package .* not found/i).end(done);
		});

	});

});
