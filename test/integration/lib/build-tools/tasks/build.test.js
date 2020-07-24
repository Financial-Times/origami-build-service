'use strict';

const proclaim = require('proclaim');
const gulp = require('gulp');

const fs = require('fs-extra');
const path = require('path');

const build = require('../../../../../lib/build-tools/tasks/build');
const logMock = require('../../../../mock/log.mock');

const testRoot = path.join(__dirname, '../');
const fixturePath = path.join(testRoot, 'fixtures/o-test');

const CORE_JS_IDENTIFIER = '__core-js_shared__';

describe('Build task', function() {
	let testPath;
	let buildDuplex;

	beforeEach(function () {
		testPath = path.join(testRoot, `.test-run-build-${Date.now()}`);
		fs.copySync(fixturePath, testPath);
	});

	afterEach(function () {
		// End the build duplex if it hasn't ended already.
		buildDuplex.end();
		fs.removeSync(testPath);
	});

	describe('Build Js', function () {
		let defaultOptions;

		beforeEach(function () {
			defaultOptions = {
				cwd: testPath,
				buildFolder: path.join(testPath, '/build'),
				js: path.join(testPath, '/main.js'),
			};
		});

		it('should work with default options', function(done) {
			buildDuplex = build.js(gulp, logMock, defaultOptions)
				.on('end', function() {
					const builtJsPath = path.join(defaultOptions['buildFolder'], 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, '\n\nmodule.exports = {"test":true}\n\n');
					done();
				});
		});

		it('should work with production option', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					env: 'production'
				}))
				.on('end', function () {
					const builtJsPath = path.join(defaultOptions['buildFolder'], 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.doesNotInclude(builtJs, 'sourceMappingURL');
					proclaim.doesNotInclude(builtJs, 'var Test');
					proclaim.doesNotInclude(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.doesNotInclude(builtJs, '"This is a test"');
					proclaim.doesNotInclude(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
			});
		});

		it('should include the the babel-runtime polyfills by default', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					js: path.join(testPath, './src/js/babelRuntime.js')
				}))
				.on('end', function () {
					const builtJsPath = path.join(defaultOptions['buildFolder'], 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.include(builtJs, CORE_JS_IDENTIFIER);
					done();
				});
		});

		it('should not include the the babel-runtime polyfills if \'babelRuntime\' is falsey', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					js: path.join(testPath, './src/js/babelRuntime.js'),
					babelRuntime: false
				}))
				.on('end', function () {
					const builtJsPath = path.join(defaultOptions['buildFolder'], 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.doesNotInclude(builtJs, CORE_JS_IDENTIFIER);
					done();
				});
		});

		it('should build from custom source', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					js: path.join(testPath, './src/js/test.js'),
				}))
				.on('end', function () {
					const builtJsPath = path.join(defaultOptions['buildFolder'], 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.doesNotInclude(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should build to a custom directory', function(done) {
			const outputDirectory = path.join(testPath, 'custom-build-dir');
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					buildFolder: outputDirectory
				}))
				.on('end', function () {
					const builtJsPath = path.join(outputDirectory, 'main.js');
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should build to a custom file', function(done) {
			// It seems the `buildJs` option has to be relative, at the time of
			// writing Webpack throws an error for an absolute path.
			const outputName = 'bundle.js';
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					buildJs: outputName,
				}))
				.on('end', function () {
					const builtJsPath = path.join(defaultOptions['buildFolder'], outputName);
					const builtJs = fs.readFileSync(builtJsPath, 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should fail on syntax error', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					js: path.join(testPath, './src/js/syntax-error.js'),
				}))
				.on('error', function errorHandler(e) {
					if (e.message && e.message.includes('SyntaxError')) {
						done();
					}
				})
				.on('end', function() {
					done(new Error('The expected syntax error was not thrown.'));
				});
		});

		it('should fail when a dependency is not found', function(done) {
			buildDuplex = build
				.js(gulp, logMock, Object.assign({}, defaultOptions, {
					js: path.join(testPath, './src/js/missing-dep.js'),
				}))
				.on('error', function(e) {
					try {
						proclaim.include(e.message, 'Module not found: Error: Can\'t resolve \'dep\'');
						done();
					} catch (error) {}
				})
				.on('end', function() {
					// Fail quickly to not wait for test to timeout
					proclaim.isFalse(true);
					done();
				});
		});
	});

	describe('Build Sass', function() {
		let defaultOptions;

		beforeEach(function () {
			defaultOptions = {
				cwd: testPath,
				buildFolder: path.join(testPath, '/build'),
				sass: path.join(testPath, '/main.scss'),
			};
		});

		it('should work with default options', function(done) {
			buildDuplex = build.sass(gulp, logMock, defaultOptions)
				.on('end', function () {
					const builtCssPath = path.join(defaultOptions['buildFolder'], 'main.css');
					const builtCss = fs.readFileSync(builtCssPath, 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					done();
				});
		});

		it('should work with production option', function(done) {
			buildDuplex = build
				.sass(gulp, logMock, Object.assign({}, defaultOptions, {
					env: 'production'
				}))
				.on('end', function () {
					const builtCssPath = path.join(defaultOptions['buildFolder'], 'main.css');
					const builtCss = fs.readFileSync(builtCssPath, 'utf8');;
					proclaim.equal(builtCss, 'div{color:#00f}');
					done();
			});
		});

		it('should build from custom source', function(done) {
			buildDuplex = build
				.sass(gulp, logMock, Object.assign({}, defaultOptions, {
					sass: path.join(testPath, './src/scss/test.scss')
				}))
				.on('end', function () {
					const builtCssPath = path.join(defaultOptions['buildFolder'], 'main.css');
					const builtCss = fs.readFileSync(builtCssPath, 'utf8');
					proclaim.include(builtCss, 'p {\n  color: #000000; }\n');
					done();
				});
		});

		it('should build to a custom directory', function(done) {
			const outputFolder = path.join(testPath, '/test-build/');
			buildDuplex = build
				.sass(gulp, logMock, Object.assign({}, defaultOptions, {
					buildFolder: outputFolder
				}))
				.on('end', function () {
					const builtCssPath = path.join(outputFolder, 'main.css');
					const builtCss = fs.readFileSync(builtCssPath, 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					done();
				});
		});

		it('should build to a custom file', function(done) {
			const outputName = 'bundle.css';
			buildDuplex = build
				.sass(gulp, logMock, Object.assign({}, defaultOptions, {
					buildCss: outputName
				}))
				.on('end', function () {
					const builtCssPath = path.join(defaultOptions['buildFolder'], outputName);
					const builtCss = fs.readFileSync(builtCssPath, 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					done();
				});
		});
	});
});
