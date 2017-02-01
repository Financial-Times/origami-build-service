'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');

const InstallationManager = testhelper.InstallationManager;
const Bundler = testhelper.Bundler;
const ModuleMetadata = testhelper.ModuleMetadata;

suiteWithPackages('metadata-api', [], function(temporaryDirectory){
	this.timeout(60*1000);

	spawnTest('metadata-ok has_external_dependency', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		const meta = yield moduleMetadata.getContent('o-test-component@1.0.18');
		assert(meta.build.bundler.valid, meta.build.bundler.error);
		assert(meta.build.css.valid);
		assert(meta.build.js.valid);
		assert(meta.build.css.bundleSize);
		assert(meta.build.js.bundleSize);
		assert(!meta.build.origami || meta.build.origami.valid);
		assert(meta.origamiManifest);
		assert.equal(meta.bowerManifest.name, 'test-component');
		assert.ok(meta.readme);

	});

	spawnTest('metadata-origami', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		const meta = yield moduleMetadata.getContent('o-test-component@1.0.10');
		assert(meta.build.bundler.valid, 'Ensure package is installable ' + JSON.stringify(meta.build.bundler));
		assert(meta.build.css.valid);
		assert(meta.build.js.valid);
		assert(meta.build.origami.valid, 'Ensure origami config can be found');
		assert.equal(meta.origamiManifest.demos[0].name, 'main');
	});

	spawnTest('metadata-fail', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		const meta = yield moduleMetadata.getContent('o-test-component@1.0.3');
		assert(meta && meta.build && meta.build.css);
		assert(!meta.build.css.valid);
		assert(meta.build.css.error.indexOf('errorhere')>=-1);
	});

	spawnTest('metadata-missingpackage', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		try {
			yield moduleMetadata.getContent('404idontexist');
			assert(false, 'Should not return anything');
		} catch(e) {
			assert(e.code === 'ENOTFOUND');
		}
	});


	spawnTest('metadata-missingsubpackage', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		const meta = yield moduleMetadata.getContent('o-test-component@1.0.14');
		assert(!meta.build.bundler.valid);
	});

	spawnTest('unusable-if-forbidden has_external_dependency', function*(){
		const installationManager = new InstallationManager({temporaryDirectory});
		const bundler = new Bundler();
		const moduleMetadata = new ModuleMetadata({
			bundler: bundler,
			installationManager: installationManager
		});
		const meta = yield moduleMetadata.getContent('o-test-component@1.0.0');
		assert.equal(meta.build.bundler.code, 'EMISSINGORIGAMICONFIG');
	}, /* skip */ true);
});
