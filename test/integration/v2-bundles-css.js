'use strict';

const request = require('supertest');

describe('GET /v2/bundles/css', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function() {
		const moduleName = __dirname + '/mock-modules/test-css-ok';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function(done) {
			this.request.expect(200).end(done);
		});

		it('should respond with the bundled CSS', function(done) {
			this.request.expect(`/** Shrinkwrap URL:\n *    /v2/bundles/css?modules=test-css-ok%40undefined%2Co-autoinit%401.2.0&shrinkwrap=o-assets%400.4.5\n */\n#test-css-ok{hello:world;silent-var:false;url:url(//build.origami.ft.com/files/test-css-ok@*/README)}`).end(done);
		});

	});

	describe('when a nonexistent module is requested', function() {
		const moduleName = __dirname + '/mock-modules/test-404';

		beforeEach(function() {
			const now = (new Date()).toISOString();
			this.request = request(this.app)
				.get(`/v2/bundles/css?modules=${moduleName}&newerthan=${now}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a CSS comment', function(done) {
			this.request.expect(`/*\n\nPackage ${moduleName} not found\n\n{\n  "endpoint": {\n    "name": "test-404",\n    "source": "${moduleName}",\n    "target": "*"\n  }\n}\n\n*/\n`).end(done);
		});

	});

});
