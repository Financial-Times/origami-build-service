'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('installation-local', ['missingmain', 'globmain'], function(installdir){

	spawnTest('missing main', function*(){
		const moduleset = new ModuleSet(['./missingmain']);
		const installation = new ModuleInstallation(moduleset, { dir:installdir, log:log });
		yield installation.install();
		const all = yield installation.listAll();

		assert.deepEqual(all.missingmain.paths, [], 'Invalid paths should be filtered out');
	});

	spawnTest('glob main', function*(){
		const moduleset = new ModuleSet(['./globmain']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});

		yield installation.install();
		const all = yield installation.listAll();

		assert.equal(all.globmain.paths.length, 1, 'Only one file should match the main glob pattern');
		assert.include(all.globmain.paths[0], '/includeme.scss');
	});
});
