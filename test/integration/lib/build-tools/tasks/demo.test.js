'use strict';

const fs = require('fs-extra');
const path = require('path');

const proclaim = require('proclaim');
const gulp = require('gulp');

const demo = require('../../../../../lib/build-tools/tasks/demo');
const logMock = require('../../../../mock/log.mock');

const testRoot = path.join(__dirname, '../');
const fixturePath = path.join(testRoot, 'fixtures/o-test');

describe('Demo task', function() {
	let testPath;
	let origamiManifestPath;
	let demoDuplex;
	let defaultOptions;


	beforeEach(function () {
		testPath = path.join(testRoot, `.test-run-demo-${Date.now()}`);
		origamiManifestPath = path.join(testPath, 'origami.json');
		fs.copySync(fixturePath, testPath);
		defaultOptions = {
			cwd: testPath
		};
	});

	afterEach(function () {
		// End the build duplex if it hasn't ended already.
		demoDuplex.end();
		fs.removeSync(testPath);
	});

	describe('Build demos', function() {
		it('should fail if there is not a config file', function(done) {
			fs.removeSync(origamiManifestPath);
			demoDuplex = demo(gulp, logMock, Object.assign({}, defaultOptions))
				.on('error', function(err) {
					proclaim.equal(err.message, 'Couldn\'t find demos config path, checked: origami.json,demos/src/config.json');
					done();
				});
			demoDuplex.resume();
		});

		it('should build demos defined in custom configuration files when specified', function (done) {
			// Define template and custom config file
			const testKey = 'custom-config';
			const configPath = `demos/src/${testKey}.json`;
			const templatePath = `demos/src/${testKey}.mustache`;
			const templateMarkup = `<div>${testKey}</div>`;
			const config = {
				options: {
					sass: 'demos/src/demo.scss',
					js: 'demos/src/demo.js',
					bodyClasses: testKey
				},
				demos: [
					{
						name: testKey,
						description: 'A test demo.',
						template: templatePath
					}
				]
			};
			// Write templates and config to the test directory
			fs.writeFileSync(path.join(testPath, configPath), JSON.stringify(config), 'utf8');
			fs.writeFileSync(path.join(testPath, templatePath), templateMarkup, 'utf8');
			// Assert the template defined in custom config is built without error.
			demo(gulp, logMock, Object.assign({}, defaultOptions, { demoConfig: configPath }))
				.on('data', function (file) {
					proclaim.include(file.path, `${testKey}.html`);
					proclaim.include(file.contents.toString('utf8'), templateMarkup);
					done();
				}).on('error', function errorHandler(err) {
					done(new Error('There was an error: ' + err.message));
				});
		});

		it('should build demos defined in origami.json by default', function(done) {
			const createdFiles = [];
			demo(gulp, logMock, Object.assign({}, defaultOptions))
				.on('data', function (file) {
					createdFiles.push({
						path: file.path,
						content: file.contents.toString('utf8'),
					});
				}).on('error', function(err) {
					done(new Error('There was an error: ' + err.message));
				}).on('end', function() {
					const test = createdFiles.find(f => f.path.includes('test.html')) || {};
					const pa11y = createdFiles.find(f => f.path.includes('pa11y.html')) || {};
					proclaim.include(test.content, '<div>test</div>');
					proclaim.include(pa11y.content, 'contrast');
					done();
				});
		});

		it('should build demos defined in origami.json using the old format', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync(origamiManifestPath, 'utf8'));
			// In the old syntax demos are keys in an object, rather than within
			// an array.
			demoConfig.demos = {
				test: {
					description: 'First test',
					template: 'demos/src/test.mustache'
				}
			};
			// At some point `options` was used over `demosDefaults`.
			delete demoConfig.demosDefaults;
			demoConfig.options = {
				sass: 'demos/src/demo.scss',
				js: 'demos/src/demo.js',
				bodyClasses: 'old-config-test'
			};
			fs.writeFileSync(origamiManifestPath, JSON.stringify(demoConfig));

			demo(gulp, logMock, Object.assign({}, defaultOptions)).on('data', function (file) {
				proclaim.include(file.path, 'test.html');
				proclaim.include(file.contents.toString('utf8'), '<div>test</div>');
				proclaim.include(file.contents.toString('utf8'), 'old-config-test');
				done();
			}).on('error', function errorHandler(err) {
				done(new Error('There was an error: ' + err.message));
			});
		});

		it('should build demos using the deprecated config.json file for demo configuration over origami.json if it exists', function (done) {
			// Define template and demos/src/config.json
			const testKey = 'demos-src-config-demo';
			const configPath = path.join(testPath, 'demos/src/config.json');
			const templatePath = `demos/src/${testKey}.mustache`;
			const templateMarkup = `<div>${testKey}</div>`;
			const config = {
				options: {
					sass: 'demos/src/demo.scss',
					js: 'demos/src/demo.js',
					bodyClasses: testKey
				},
				demos: [
					{
						name: testKey,
						description: 'A test demo.',
						template: templatePath
					}
				]
			};
			// Write templates and config to the test directory
			fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
			fs.writeFileSync(path.join(testPath, templatePath), templateMarkup, 'utf8');
			// Assert the template defined in config.json is built without error.
			demo(gulp, logMock, Object.assign({}, defaultOptions))
				.on('data', function(file) {
					proclaim.include(file.path, `${testKey}.html`);
					proclaim.include(file.contents.toString('utf8'), templateMarkup);
					done();
				}).on('error', function errorHandler(err) {
					done(new Error('There was an error: ' + err.message));
				});
		});

		it('should fail if there are demos with the same name', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync(origamiManifestPath, 'utf8'));
			const existingDemoConfig = demoConfig.demos[1];
			demoConfig.demos.push(Object.assign({}, existingDemoConfig));
			fs.writeFileSync(origamiManifestPath, JSON.stringify(demoConfig));
			demoDuplex = demo(gulp, logMock, Object.assign({}, defaultOptions))
				.on('error', function errorHandler(err) {
					proclaim.equal(err.message, 'Demos with the same name were found. Give them unique names and try again.');
					done();
				});
			demoDuplex.resume();
		});

		it('should build demo html', function(done) {
			demoDuplex = demo(gulp, logMock, Object.assign({}, defaultOptions))
			.on('end', function() {
					const test = fs.readFileSync(path.join(testPath, 'demos/test.html'), 'utf8');
					const pa11y = fs.readFileSync(path.join(testPath, 'demos/pa11y.html'), 'utf8');
					proclaim.include(test, '<div>test</div>');
					proclaim.include(pa11y, 'No contrast');
					proclaim.match(test, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					proclaim.match(pa11y, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					done();
				});

			demoDuplex.resume();
		});

		it('should load local partials', function(done) {
			fs.writeFileSync(path.join(testPath, 'demos/src/test.mustache'), `
				<div>test</div>
				{{>partial1}}
				{{>partials/partial2}}
			`, 'utf8');
			demoDuplex = demo(gulp, logMock, Object.assign({}, defaultOptions))
			.on('end', function() {
				const test = fs.readFileSync(path.join(testPath, 'demos/test.html'), 'utf8');
				proclaim.include(test, '<div>partial1</div>');
				proclaim.include(test, '<div>partial2</div>');
				done();
			});

			demoDuplex.resume();
		});
	});
});
