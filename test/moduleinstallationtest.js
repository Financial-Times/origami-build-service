'use strict';

const assert = require('chai').assert;
const testhelper = require('./testhelper');
const JsBundler = testhelper.JsBundler;
const CssBundler = testhelper.CssBundler;

const log = testhelper.log;
const pfs = testhelper.pfs;
const Q = testhelper.Q;
const ModuleInstallation = testhelper.ModuleInstallation;
const ModuleSet = testhelper.ModuleSet;

suite('installation-remote', function() {
	this.timeout(10*60*1000);

	spawnTestWithTempdir('install-external has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['jquery@2.0.3','lodash']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		let installed = yield installation.install();
		assert('jquery' in installed, 'Expected jQuery to be installed');
		assert('lodash' in installed);
		assert.equal('2.0.3', installed.jquery.pkgMeta.version);

		installed = yield installation.install();
		assert.deepEqual({}, installed, 'Nothing new should be installed');

		const list = yield installation.list();
		assert('jquery' in list);
		assert('lodash' in list);

		assert.equal(0, list.jquery.paths[0].indexOf(yield pfs.canonical(tmpdir)), 'should be absolute canonical path ' + list.jquery.paths[0]);

		const exists = yield Q.all([pfs.exists(list.jquery.paths[0]), pfs.exists(list.lodash.paths[0])]);
		assert.deepEqual([true,true], exists, 'Expected installed files to exist');

		const jsStream = yield (new JsBundler({log:log})).getContent(installation, moduleset, {minify:'none'});

		const jsContent = yield testhelper.bufferStream(jsStream);

		assert(jsContent.indexOf('lodash') >= 0, 'Expected Lo-Dash (doccomment) in the output');
		assert.include(jsContent, 'jQuery', 'Expected jQuery in the output');

		const destroyed = yield installation.destroy();
		assert(!destroyed, 'After destroy() the directory should not longer exist');
	});

	spawnTestWithTempdir('export has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['https://github.com/Financial-Times/o-assets.git']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		yield installation.install();
		const jsStream = yield (new JsBundler({log:log})).getContent(installation, moduleset, {exportName:'myExportVariable'});
		const jsContent = yield testhelper.bufferStream(jsStream);

		assert.include(jsContent, 'myExportVariable');
	});

	spawnTestWithTempdir('install-implied-main has_external_dependency', function*(tmpdir){
		const moduleset = new ModuleSet(['Financial-Times/o-ft-forms']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		const installed = yield installation.install();
		assert('o-ft-forms' in installed);

		const list = yield installation.list();
		assert('o-ft-forms' in list);
		assert.include(list['o-ft-forms'].paths[0], 'bower_components/o-ft-forms/main.scss');

		const path = installation.getPathToComponentsFile('o-ft-forms', '../../main.scss');
		assert.include(path, 'bower_components/o-ft-forms/main.scss');
		assert.notInclude(path, '..');

		const cssStream = yield (new CssBundler({log:log})).getContent(installation, moduleset);
		const css = yield testhelper.bufferStream(cssStream);
		assert.include(css, '.o-ft-forms__label');
	});

	spawnTestWithTempdir('css-no-minify has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['o-gallery']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });

		yield installation.install();
		const bundler = new CssBundler({log:log});
		const cssStream= yield bundler.getContent(installation, moduleset, {minify:'none'});
		const css = yield testhelper.bufferStream(cssStream);
		assert.include(css, '/*', 'expected comments in unminified CSS');
	});

	spawnTestWithTempdir('version-of-subresource has_external_dependency', function*(tmpdir) {
		const moduleset = new ModuleSet(['o-gallery']);
		const installation = new ModuleInstallation(moduleset, { dir: tmpdir, log: log });
		yield installation.install();
		const cssStream = yield (new CssBundler({log:log})).getContent(installation, moduleset, {minify:'none'});

		const css = yield testhelper.bufferStream(cssStream);

		assert.notInclude(css, 'o-ft-icons/build/ft-icons');
		assert.include(css, 'o-ft-icons@', 'Subresource needs to be versioned');
	});
});
