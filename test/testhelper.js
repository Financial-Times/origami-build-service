'use strict';

const uuid = require('uuid').v4;
const rmrf = require('rimraf');

const log = require('./mock/log.mock');

const fs = require('fs-extra');
const path = require('path');
const Q = require('../lib/utils/q');
const Output = require('../lib/output');
const ModuleSet = require('../lib/moduleset');
const PromiseCache = require('../lib/utils/promisecache');
const ModuleInstallation = require('../lib/moduleinstallation');
const InstallationManager = require('../lib/installationmanager');
const Bundler = require('../lib/bundler');
const JsBundler = require('../lib/jsbundler');
const CssBundler = require('../lib/cssbundler');
const DemoCompiler = require('../lib/democompiler');
const Registry = require('../lib/registry.js');
const ModuleMetadata = require('../lib/modulemetadata');
const FileProxy = require('../lib/fileproxy');

const createApp = require('../lib/build-service');

Q.longStackSupport = true;

function describeWithPackages(name, packages, callback) {
	return describe(name, function() {
		const tempdir = fs.realpathSync('/tmp') + '/buildservice-test/' + uuid();

		before(function(done) {
			fs.ensureDir(tempdir)
				.then(function() {
				// Make some symbolic links to the test modules in this
				// repository in the temporary directory.  When the cache
				// tries to reclaim from disk it will pick up the modules
				// we've created symlinks to here
					return Promise.all(packages.map(function(name){
						const src = path.join(__dirname, '/testmodules/', name);
						const dst = path.join(tempdir, '/', name.replace(/^.*\//,''));
						return fs.symlink(dst, src, 'dir').catch(err => {
							if (err.code !== 'EEXIST') {
								throw err;
							}
						});
					}));
				})
				.then(function() { done(); });
		});

		callback.call(this, tempdir);

		after(function(){
			rmrf.sync(tempdir);
		});
	});
}

global.describeWithPackages = describeWithPackages;

function spawnTest(name, generatorCallback, shouldSkip, only) {
	let testFunc = it;
	if (shouldSkip) {
		testFunc = it.skip;
	}
	if (only) {
		testFunc = it.only;
	}
	return testFunc(name, function(done) {
		promiseTest.call(this, generatorCallback, done);
	});
}


spawnTest.skip = it.skip.bind(it);
global.spawnTest = spawnTest;

function spawnTestWithTempdir(name, generatorCallback) {
	return it(name, function(done) {
		const tmpdir = fs.realpathSync('/tmp') + '/buildservice-test/' + uuid();

		const scopedGenerator = function*() {
			yield* generatorCallback.call(this, tmpdir);
		};

		promiseTest.call(this, scopedGenerator, done).then(function() {
			rmrf.sync(tmpdir);
		});
	});
}

function promiseTest(generatorCallback, done) {
	const testResult = Promise.resolve(Q.async(generatorCallback.bind(this))());

	return testResult.then(() => {
		done();
	}).catch((err) => {
		done(err);
	});
}

function bufferStream(stream) {
	return new Promise(function(resolve, reject) {
		let buffer = '';
		stream.on('data', function(data) {
			buffer += data.toString();
		});

		stream.on('end', function() {
			resolve(buffer);
		});

		stream.on('error', function(err) {
			reject(err);
		});
	});
}

spawnTestWithTempdir.skip = it.skip.bind(it);
global.spawnTestWithTempdir = spawnTestWithTempdir;

module.exports = {
	describeWithPackages:describeWithPackages,
	spawnTest:spawnTest,
	spawnTestWithTempdir: spawnTestWithTempdir,

	Q:Q,
	fs: fs,
	log: log,
	ModuleInstallation: ModuleInstallation,
	InstallationManager: InstallationManager,
	Output: Output,
	ModuleSet: ModuleSet,
	Bundler: Bundler,
	JsBundler: JsBundler,
	CssBundler: CssBundler,
	DemoCompiler: DemoCompiler,
	PromiseCache: PromiseCache,
	Registry: Registry,
	FileProxy: FileProxy,
	ModuleMetadata: ModuleMetadata,
	createApp: createApp,
	bufferStream: bufferStream
};
