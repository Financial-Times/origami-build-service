'use strict';

const assert = require('chai').assert;
const URL = require('url');
const fs = require('fs');
const querystring = require('querystring');
const supertest = require('supertest');
const testhelper = require('./testhelper');
const hostnames = require('../lib/utils/hostnames');
const log = require('./unit/mock/log.mock');
const metrics = require('./unit/mock/origami-service.mock').mockApp.origami.metrics;

const InstallationManager = testhelper.InstallationManager;
const createApp = testhelper.createApp;

suiteWithPackages('files-api', [], function(temporaryDirectory){
	this.timeout(60*1000);

	let FileProxy;
	let Registry;

	beforeEach(() => {
		FileProxy = require('../lib/fileproxy');
		Registry = require('../lib/registry');
	});

	spawnTest('files-json', function*(){
		const installationManager = new InstallationManager({temporaryDirectory, log, metrics});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});
		const info = yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('o-test-component@1.0.8') + '/origami.json'));
		assert.include(info.path, '/o-test-component/origami.json');
		assert.equal(info.mimeType, 'application/json');
		assert(info.mtime);
		assert(info.mtime.toUTCString);
	});

	spawnTest('files-registry-ok', function*(){
		const installationManager = new InstallationManager({temporaryDirectory, log, metrics});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});
		yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('o-test-component@1.0.8') + '/main.js'));
	});

	spawnTest('files-registry-reject', function*(){
		const installationManager = new InstallationManager({temporaryDirectory, log, metrics});
		const fileProxy = new FileProxy({
			installationManager: installationManager,
			registry: new Registry()
		});
		try {
			yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('lodash') + '/main.js'));
			assert.ok(false, 'Should throw');
		} catch(e) {
			assert.equal(e.statusCode, 403);
		}
	});

	spawnTest('files-missing', function*(){
		const installationManager = new InstallationManager({temporaryDirectory, log, metrics});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});

		try {
			yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('o-test-component@1.0.8') + '/..%2Ftest.json'));
			assert.ok(false);
		} catch(err) {
			assert.include(err.message, '/test.json', 'Should use decoded subpath');
			assert.notInclude(err.message, temporaryDirectory, 'Should not expose internals');
		}
	});

	test('files-replaces-versions', function(){
		const fileProxy = new FileProxy();
		const parsed = fileProxy.versionLockBuildserviceUrls(''+fs.readFileSync(__dirname + '/testmodules/html/demo.html'), 'html', '9.99', 'https://' + hostnames.preferred + '/files/html/9.99/demo.html');

		assert.include(parsed, 'html@0.1/no-change');
		assert.include(parsed, 'files/html/css.css', 'Rewrite not supported, use relative URLs');

		const unescaped = querystring.unescape(parsed);
		assert.include(unescaped, 'modules=yup@1,html@9.99,foo');
		assert.include(unescaped, 'modules=relative@1,html@9.99:/withfile,foo');
		assert.include(unescaped, 'modules=nope@1,html,foo@*');
		assert.include(unescaped, 'modules=bar-html,html@*,nochange@*');
		assert.include(unescaped, '//' + hostnames.preferred + '/v2/bundles/js?modules=html2@v1.0,html@9.99,foo', '2');
		assert.include(unescaped, 'differenthost,html,foo@*');
		assert.include(unescaped, 'otherargs=zzz&amp;modules=singlequotes,html@9.99');
	});

	test('gallery-lock has_external_dependency', function(done){
		const app = createApp({
			defaultLayout: 'main',
			environment: 'test',
			log: log,
			port: 0,
			requestLogFormat: null,
			staticBundlesDirectory: `${__dirname}/mock-static-bundles`,
			tempdir: temporaryDirectory
		});
		app.listen().then(app => {
			const regexp = new RegExp('/bundles/css\\?modules=o-gallery%401\\.1\\.0%3A%2Fdemos%2Fsrc%2Fdemo\\.scss"');
			supertest(app)
				.get('/v2/files/o-gallery@1.1.0/demos/declarative.html')
				.expect(200)
				.expect(regexp, done);
		});
	});
});
