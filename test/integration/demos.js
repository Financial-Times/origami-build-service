// https://www.ft.com/__origami/service/build/demos/o-buttons@4.5.0/standard

'use strict';

const request = require('supertest');

describe('GET /demos', function() {
	this.timeout(40400);
	this.slow(5000);

	describe('when a valid module and demo are requested', function() {
		const moduleName = 'o-buttons';
		const pathName = 'standard';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons/standard\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested', function() {
		const moduleName = 'o-buttons';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons/\n').end(done);
		});

	});

	describe('when a valid module and no demo is requested, without ending /', function() {
		const moduleName = 'o-buttons';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons\n').end(done);
		});

	});

	describe('when a valid module at specific version and demo are requested', function() {
		const moduleName = 'o-buttons@4.5.0';
		const pathName = 'standard';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with the expected `Content-Type` header', function(done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});

		it('should respond with the file contents', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons@4.5.0/standard\n').end(done);
		});

	});

	describe('when a valid module and non-existent demo are requested', function() {
		const moduleName = 'o-buttons';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons/NOTADEMO\n').end(done);
		});

	});

	describe('when a valid module at specific version but non-existent demo are requested', function() {
		const moduleName = 'o-buttons@4.5.0';
		const pathName = 'NOTADEMO';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons@4.5.0/NOTADEMO\n').end(done);
		});

	});

	describe('when an non-existent module is requested', function() {
		const moduleName = 'non-existent-module';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('Cannot GET /demos/non-existent-module/README.md\n').end(done);
		});

	});

	describe('when an invalid module (non-existent) at specific version is requested', function() {
		const moduleName = 'non-existent-module@1.0.0';
		const pathName = 'README.md';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('Cannot GET /demos/non-existent-module@1.0.0/README.md\n').end(done);
		});

	});

	describe('when a valid module at non-existent version is requested', function() {
		const moduleName = 'o-buttons@99.0.0';
		const pathName = 'standard';

		beforeEach(function() {
			this.request = request(this.app)
				.get(`/demos/${moduleName}/${pathName}`)
				.set('Connection', 'close');
		});

		it('should respond with a 404 status', function(done) {
			this.request.expect(404).end(done);
		});

		it('should respond with an error message in a comment', function(done) {
			this.request.expect('Cannot GET /demos/o-buttons@99.0.0/standard\n').end(done);
		});

	});

});
