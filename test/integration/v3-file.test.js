'use strict';

const proclaim = require('proclaim');
const request = require('supertest');

describe('GET /v3/files', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid module is requested', function () {
		const moduleName = '@financial-times/o-table@*';
		const file = 'package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module=${moduleName}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with the requested file', function (done) {
			this.request
				.expect(({text}) => {
					const moduleName = JSON.parse(text).name;
					proclaim.deepEqual(moduleName, '@financial-times/o-table');
				})
				.end(done);
		});

		it('should respond with a 200 status', function (done) {
			this.request.expect(200).end(done);
		});
		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'application/json; charset=UTF-8')
				.end(done);
		});
	});

	describe('when an invalid module is requested (nonexistent)', function () {
		const moduleName = 'hello-nonexistent-module@1';
		const file = 'package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module=${moduleName}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({text}) => {
					proclaim.deepEqual(
						text,
						'/*"Origami Build Service returned an error: hello-nonexistent-module@1 is not in the npm regsitry"*/'
					);
				})
				.end(done);
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});
	});

	describe('when the file requested does not exist', function () {
		const moduleName = 'o-test-component@1.0.1';
		const file = 'non-existant-file.magic';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module=${moduleName}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({text}) => {
					proclaim.deepEqual(
						text,
						'/*"Origami Build Service returned an error: o-test-component@1.0.1 does not contain a file named \'non-existant-file.magic\'."*/'
					);
				})
				.end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request.expect('Content-Type', 'text/html; charset=utf-8').end(done);
		});
	});

	describe('when the module parameter is missing', function () {
		const file = 'package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(`/v3/files?file=${file}&system_code=${system}`)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(
					'/*"Origami Build Service returned an error: The module query parameter can not be empty."*/'
				)
				.end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'text/html; charset=utf-8')
				.end(done);
		});
	});

	describe('when the module parameter is not a string', function () {
		const file = 'package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module[]=foo&module[]=bar&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(
					'/*"Origami Build Service returned an error: The module query parameter must be a string."*/'
				)
				.end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'text/html; charset=utf-8')
				.end(done);
		});
	});

	describe('when a module name cannot be parsed', function () {
		const moduleName = 'http://1.2.3.4/';
		const file = 'package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module=${moduleName}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({text}) => {
					proclaim.deepStrictEqual(
						text,
						'/*"Origami Build Service returned an error: The module query parameter contains a name which is not valid: http://1.2.3.4/."*/'
					);
				})
				.end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'text/html; charset=utf-8')
				.end(done);
		});
	});

	describe('when the file parameter is an invalid value', function () {
		const moduleName = '@financial-times/o-utils@1.1.7';
		const file = '../package.json';
		const system = 'origami-build-service';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/files?module=${moduleName}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({text}) => {
					proclaim.deepStrictEqual(
						text,
						'/*"Origami Build Service returned an error: The file query parameter must be a path within the requested component."*/'
					);
				})
				.end(done);
		});

		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'text/html; charset=utf-8')
				.end(done);
		});
	});
});
