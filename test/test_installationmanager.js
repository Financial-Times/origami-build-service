'use strict';
const assert = require('assert');
const testhelper = require('./testhelper');

const log = testhelper.log;
const InstallationManager = testhelper.InstallationManager;
const ModuleSet = testhelper.ModuleSet;
const pfs = require('q-io/fs');

suiteWithPackages('InstallationManager#createInstallation(moduleset, options)', [ 'test1' ], function(installdir) {
	this.timeout(20*1000);

	spawnTest('it should delete any cached modules on disk when an object is evicted from the cache', function*() {
		const installer = new InstallationManager({
			log: log,
			temporaryDirectory: installdir,
			whitelist: '*',
			capacity: 1
		});

		const modulesetA = new ModuleSet(['./../test1']);
		const modulesetB = new ModuleSet(['o-autoinit']);

		const installationA = yield installer.createInstallation(modulesetA);
		const installationADirectory = installationA.getDirectory();

		// The directory for installation A should exist
		assert((yield pfs.isDirectory(installationADirectory)) === true);

		yield installer.createInstallation(modulesetB);

		// The directory for installation A should now not exist because the
		// capacity of the LRU cache is 1
		assert((yield pfs.isDirectory(installationADirectory)) === false);
	});

	spawnTest('it should create a ModuleInstallation for the requested ModuleSet', function*() {
		const installer = new InstallationManager({
			log: log,
			temporaryDirectory: installdir,
			whitelist: '*'
		});

		const moduleset = new ModuleSet(['./../test1']);

		const installation = yield installer.createInstallation(moduleset);
		const installedModules = yield installation.listAll();

		assert(installedModules['o-assets']);
		assert(installedModules['test1']);
		assert(Object.keys(installedModules).length === 2);

		assert.equal('~0.4.4', installedModules['o-assets'].target);
		assert.equal('*', installedModules['test1'].target);
	});

	spawnTest('it should refuse to install modules that are not hosted on whitelisted domains if they don\'t have an origami.json', function*() {
		const installer = new InstallationManager({
			log: log, temporaryDirectory: installdir, whitelist: { 'example.org': true }
		});

		const moduleset = new ModuleSet(['bootstrap']);

		let thrownException = false;

		try {
			yield installer.createInstallation(moduleset);
		} catch(error) {
			thrownException = error;
		}

		assert(thrownException !== false);
		assert.equal('EMISSINGORIGAMICONFIG', thrownException.code);
	});

});
