'use strict';

const proclaim = require('proclaim');
const request = require('supertest');

describe('GET /v3/font', function () {
	this.timeout(20000);
	this.slow(5000);

	describe('when a valid font is requested', function () {
		const version = '*';
		const font = 'BentonSans-Bold';
		const format = 'woff2';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 200 status', function (done) {
			this.request.expect(200).end(done);
		});
		it('should respond with the expected `Content-Type` header', function (done) {
			this.request
				.expect('Content-Type', 'font/woff2')
				.end(done);
		});
	});

	describe('when an invalid version is requested', function () {
		const version = '1hg';
		const file = 'BentonSans-Bold.woff2';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version=${version}&file=${file}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(({text}) => {
					proclaim.deepEqual(
						text,
						'"Origami Build Service returned an error: The version 1hg is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
					);
				})
				.end(done);
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});

	describe('when the font requested does not exist', function () {
		const version = '*';
		const font = 'non-existant-file';
		const format = 'magic';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`
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
						'"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."'
					);
				})
				.end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});

	describe('when the version parameter is missing', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app).get(
				`/v3/font?font_name=${font}&font_format=${format}&system_code=${system}`
			).set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(
					'"Origami Build Service returned an error: The version query parameter can not be empty."'
				)
				.end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});

	describe('when the version parameter is not a string', function () {
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version[]=foo&version[]=bar&font_name=${font}&font_format=${format}&system_code=${system}`
				)
				.set('Connection', 'close');
		});

		it('should respond with a 400 status', function (done) {
			this.request.expect(400).end(done);
		});

		it('should respond with an error message', function (done) {
			this.request
				.expect(
					'"Origami Build Service returned an error: The version query parameter must be a string."'
				)
				.end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});

	describe('when a version cannot be parsed', function () {
		const version = 'http://1.2.3.4/';
		const font = 'font';
		const format = 'woff';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`
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
						'"Origami Build Service returned an error: The version http://1.2.3.4/ is not a valid version.\\nPlease refer to TODO (build service documentation) for what is a valid version."'
					);
				})
				.end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});

	describe('when the font_format parameter is an invalid value', function () {
		const version = '*';
		const font = 'font';
		const format = 'json';
		const system = 'origami';

		beforeEach(function () {
			this.request = request(this.app)
				.get(
					`/v3/font?version=${version}&font_name=${font}&font_format=${format}&system_code=${system}`
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
						'"Origami Build Service returned an error: The font_format query parameter must be one of the supported formats: woff woff2."'
					);
				})
				.end(done);
		});

		context('is not vulnerable to cross-site-scripting (XSS) attacks', function() {
			it('should respond with the expected `Content-Type` header', function(done) {
				this.request.expect('Content-Type', 'text/plain; charset=utf-8').end(done);
			});

			it('should respond with the expected `X-Content-Type-Options` header set to `nosniff`', function(done) {
				this.request.expect('X-Content-Type-Options', 'nosniff').end(done);
			});
		});
	});
});
