'use strict';

const assert = require('chai').assert;
const URL = require('url');
const fs = require('fs');
const querystring = require('querystring');
const supertest = require('supertest');
const testhelper = require('./testhelper');
const hostnames = require('../lib/utils/hostnames');

const log = testhelper.log;
const InstallationManager = testhelper.InstallationManager;
const createApp = testhelper.createApp;
const BuildSystem = testhelper.BuildSystem;

suiteWithPackages('files-api', ['files'], function(installdir){
	this.timeout(60*1000);

	let FileProxy;
	let Registry;

	beforeEach(() => {
		FileProxy = require('../lib/fileproxy');
		Registry = require('./unit/mock/registry.mock');
	});

	spawnTest('files-json', function*(){
		const installationManager = new InstallationManager({temporaryDirectory:installdir, whitelist:'*'});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});
		const info = yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('../files') + '@*/test.json'));
		assert.include(info.path, '/files/test.json');
		assert.equal(info.mimeType, 'application/json');
		assert(info.mtime);
		assert(info.mtime.toUTCString);
	});

	spawnTest('files-registry-ok', function*(){
		const fakeregistry = new Registry();
		fakeregistry.packageListByURL.resolves({
			[installdir + '/files']: {url: installdir + '/files'}
		});
		const installationManager = new InstallationManager({temporaryDirectory:installdir, whitelist:'*'});
		const fileProxy = new FileProxy({
			registry: fakeregistry,
			installationManager: installationManager
		});
		yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('../files') + '@*/test.json'));
	});

	spawnTest('files-registry-reject', function*(){
		const fakeregistry = new Registry();
		fakeregistry.packageListByURL.resolves({
			[installdir + '/files-not']: {url: installdir + '/files-not'}
		});
		const installationManager = new InstallationManager({temporaryDirectory:installdir, whitelist:'*'});
		const fileProxy = new FileProxy({
			registry: fakeregistry,
			installationManager: installationManager
		});
		try {
			yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('../files') + '@*/test.json'));
			assert.ok(false, 'Should throw');
		} catch(e) {
			assert.equal(e.statusCode, 403);
		}
	});

	spawnTest('files-missing', function*(){
		const installationManager = new InstallationManager({temporaryDirectory:installdir, whitelist:'*'});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});

		try {
			yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('../files') + '@*/sub/dir%2Ffail.404'));
			assert(false);
		} catch(err) {
			assert.include(err.message, 'sub/dir/fail.404', 'Should use decoded subpath');
			assert.notInclude(err.message, installdir, 'Should not expose internals');
		}
	});


	spawnTest('files-rejectunwhitelisted', function*() {
		const installationManager = new InstallationManager({temporaryDirectory:installdir, whitelist:'*'});
		const fileProxy = new FileProxy({
			installationManager: installationManager
		});
		try {
			yield fileProxy.getFileInfo(URL.parse('/files/' + encodeURIComponent('../files') + '@*/test.json'));
			assert(false);
		} catch(e) {
			// expected error
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
		const buildSystem = new BuildSystem({tempdir:'/tmp/', log:log, whitelist:'*', registry: new testhelper.Registry()});
		const srv = createApp({ buildSystem: buildSystem });
		const agent = supertest(srv);
		const regexp = new RegExp('/bundles/css\\?modules=o-gallery%401\\.1\\.0%3A%2Fdemos%2Fsrc%2Fdemo\\.scss"');
		agent.get('/v2/files/o-gallery@1.1.0/demos/declarative.html')
			.expect(200)
			.expect(regexp, done);
	});
});
