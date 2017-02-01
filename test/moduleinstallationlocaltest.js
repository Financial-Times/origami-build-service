'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('installation-local', [], function(installdir){

	spawnTest('missing main', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.17']);
		const installation = new ModuleInstallation(moduleset, { dir:installdir, log:log });
		yield installation.install();
		const all = yield installation.listAll();

		assert.deepEqual(all['o-test-component'].paths, [], 'Invalid paths should be filtered out');
	});

	spawnTest('glob main', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.19']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});

		yield installation.install();
		const all = yield installation.listAll();

		assert.equal(all['o-test-component'].paths.length, 1, 'Only one file should match the main glob pattern');
		assert.include(all['o-test-component'].paths[0], '/main.scss');
	});
});
