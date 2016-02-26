'use strict';

const request = require('supertest');

describe('GET /v2/files', function() {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module and file path are requested', function() {
		const moduleName = 'mock-modules%2Ftest-ok';
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
			this.request.expect('I\'m a README\n').end(done);
		});

	});

	describe('when a valid module but invalid file path (nonexistent) are requested', function() {
		const moduleName = 'mock-modules%2Ftest-ok';
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

	describe('when an invalid module (nonexistent) is requested', function() {
		const moduleName = 'mock-modules%2Ftest-404';
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
