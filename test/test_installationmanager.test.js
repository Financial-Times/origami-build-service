'use strict';
const assert = require('assert');
const testhelper = require('./testhelper');

const log = testhelper.log;
const metrics = require('./unit/mock/origami-service.mock').mockApp.ft.metrics;
const InstallationManager = testhelper.InstallationManager;
const ModuleSet = testhelper.ModuleSet;
const fs = require('fs-extra');

describeWithPackages('InstallationManager#createInstallation(moduleset, options)', [ 'test1' ], function(installdir) {
	this.timeout(20*1000);

	spawnTest('it should delete any cached modules on disk when an object is evicted from the cache', function*() {
		const installer = new InstallationManager({
			metrics: metrics,
			log: log,
			temporaryDirectory: installdir,
			capacity: 1
		});

		const modulesetA = new ModuleSet(['o-test-component@1.0.16']);
		const modulesetB = new ModuleSet(['o-test-component@1.0.19']);

		const installationA = yield installer.createInstallation(modulesetA);
		const installationADirectory = installationA.getDirectory();

		// The directory for installation A should exist
		assert((yield fs.pathExists(installationADirectory)) === true);

		yield installer.createInstallation(modulesetB);

		// The directory for installation A should now not exist because the
		// capacity of the LRU cache is 1
		assert((yield fs.pathExists(installationADirectory)) === false);
	});

	spawnTest('it should create a ModuleInstallation for the requested ModuleSet', function*() {
		const installer = new InstallationManager({
			metrics: metrics,
			log: log,
			temporaryDirectory: installdir
		});

		const moduleset = new ModuleSet(['o-test-component@1.0.19']);

		const installation = yield installer.createInstallation(moduleset);
		const installedModules = yield installation.listAll();

		assert(installedModules['o-test-component']);
		assert(Object.keys(installedModules).length === 1);

		assert.equal('1.0.19', installedModules['o-test-component'].target);
	});

	spawnTest('it should refuse to install modules that are not hosted on whitelisted domains if they don\'t have an origami.json', function*() {
		const installer = new InstallationManager({
			metrics: metrics,
			log: log, temporaryDirectory: installdir
		});

		const moduleset = new ModuleSet(['bootstrap']);

		let thrownException = false;

		try {
			yield installer.createInstallation(moduleset);
		} catch(error) {
			thrownException = error;
		}
		assert.ok(thrownException);
		assert.equal('EMISSINGORIGAMICONFIG', thrownException.code);
	}, /* skip */ true);

});
