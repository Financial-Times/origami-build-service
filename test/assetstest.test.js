'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const JsBundler = testhelper.JsBundler;
const hostnames = require('../lib/utils/hostnames');

const log = testhelper.log;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

describe('assets', function(){
	this.timeout(120*1000);

	spawnTestWithTempdir('excluded has_external_dependency', function*(tempdir){
		const moduleset = new ModuleSet(['o-colors']);
		const installation = new ModuleInstallation(moduleset, { dir:tempdir, log:log });

		yield installation.install(moduleset);

		const js = (yield (new JsBundler({ log: log })).getContent(installation, moduleset)).toString();
		assert.notInclude(js, 'o-assets');
		assert.notInclude(js, 'setGlobalPathPrefix');
	});

	spawnTestWithTempdir('included has_external_dependency', function*(tempdir){
		const moduleset = new ModuleSet(['o-header']);
		const installation = new ModuleInstallation(moduleset, {dir:tempdir, log:log});

		yield installation.install(moduleset);

		const jsStream = yield (new JsBundler({ log: log })).getContent(installation, moduleset);
		const js = yield testhelper.bufferStream(jsStream);

		assert.include(js, 'o-assets');
		assert.include(js, 'setGlobalPathPrefix');
		assert.include(js, 'https://' + hostnames.preferred + '/v2/files/');
	});

});
