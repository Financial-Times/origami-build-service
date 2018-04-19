'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const DemoCompiler = testhelper.DemoCompiler;

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suiteWithPackages('demo-compilation', [], function(installdir){
	this.timeout(60*1000);

	spawnTest('race', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.9']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, {dir: installdir, log:log});
		yield installation.install();

		const result = yield testhelper.bufferStream(yield (new DemoCompiler({ log: log })).getContent(installation, moduleset, brand, {}));
		assert.include(result, '<body>\n<div>\n</div>', 'Demo should be generated');
	});

	spawnTest('invalid-config', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.0']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, {dir: installdir, log:log});
		yield installation.install();

		try {
			yield testhelper.bufferStream(yield (new DemoCompiler({ log: log })).getContent(installation, moduleset, brand, {}));
		} catch(err) {
			assert.include(err.message, 'Couldn\'t find demos config path', '\'No config path found\' error should be thrown');
			return;
		}
		assert(false, 'Should have failed');
	});


	spawnTest('invalid-syntax', function*(){
		const moduleset = new ModuleSet(['o-test-component@1.0.8']);
		const brand = 'master';
		const installation = new ModuleInstallation(moduleset, {dir:installdir, log:log});
		yield installation.install();

		try {
			yield testhelper.bufferStream(yield (new DemoCompiler({log:log})).getContent(installation, moduleset, brand, {}));
		} catch(err) {
			assert.notInclude(err.message, 'Couldn\'t find demos config path', 'Should find default origami.json config file');
			assert.include(err.message, 'Unclosed section', 'Should throw correct mustache syntax error');
			return;
		}
		assert(false, 'Should have failed');
	});
});
