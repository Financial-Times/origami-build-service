'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const JsBundler = testhelper.JsBundler;

const log = testhelper.log;
const Q = testhelper.Q;
const ModuleInstallation = testhelper.ModuleInstallation;
const InstallationManager = testhelper.InstallationManager;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('installation-js', ['invalidjs', 'js'], function(installdir){
	this.timeout(60*1000);

	spawnTest('race', function*(){
		const bundler = new JsBundler({log:log});
		const installer = new InstallationManager({
			temporaryDirectory: installdir,
			log:log,
			whitelist: '*'
		});

		yield Q.all([1,2,3].map(Q.async(function*(num){
			const moduleset = new ModuleSet(['../js:/' + num + '.js']);

			// Must use caching here, that's how buildservice makes bower safe against race conditions
			const installation = yield installer.createInstallation(moduleset);
			assert.instanceOf(installation, ModuleInstallation);

			const result = yield testhelper.bufferStream(yield bundler.getContent(installation, moduleset, { minify: false }));
			assert(result.toString().indexOf(num + ';\n') >= 0, 'Source code of file ' + num + ' should be in the output');
		})));
	});

	spawnTest('invalid-require', function*(){
		const moduleset = new ModuleSet(['./invalidjs']);
		const installation = new ModuleInstallation(moduleset, {dir: installdir, log:log, whitelist:'*'});

		yield installation.install();
		try {
			yield testhelper.bufferStream(yield (new JsBundler({log:log})).getContent(installation, moduleset, {minify:'none'}));
		} catch(err) {
			assert.include(err.message, 'missingmodule', 'Error from jsbundler should be included: ' + err.stack);
			assert.notInclude(err.message, installdir, 'Should hide full path');
			return;
		}
		assert(false, 'Should have failed');
	});


	spawnTest('invalid-syntax', function*(){
		const moduleset = new ModuleSet(['./invalidjs:/syntaxerr.js']);
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log, whitelist:'*'});

		yield installation.install();
		try {
			yield testhelper.bufferStream(yield (new JsBundler({log:log})).getContent(installation, moduleset, {minify:'none'}));
		} catch(err) {
			assert.notInclude(err.message, 'missingmodule', 'Should use custom file');
			assert.include(err.message, 'Unexpected character \'#\'', 'Should use custom file');
			assert.notInclude(err.message, installdir, 'Should hide full path');
			return;
		}
		assert(false, 'Should have failed');
	});
});
