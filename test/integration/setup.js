'use strict';

const BuildSystem = require('../../lib/buildsystem');
const createApp = require('../../lib');
const log = require('../../lib/utils/log');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

before(function() {

	// This overrides the Bower shorthand resolve, which allows us to
	// refer to `mock-modules/<name>` in all of the tests. Bower will
	// look on the local file-system instead of trying to load modules
	// from GitHub or the registry.
	process.env.bower_shorthand_resolver = `${__dirname}/{{shorthand}}`;

	this.temporaryDirectory = `/tmp/buildservice/tests-${uuid()}`;
	mkdirp.sync(this.temporaryDirectory);
	this.buildSystem = new BuildSystem({
		log: log,
		tempdir: this.temporaryDirectory
	});
	this.app = createApp({
		buildSystem: this.buildSystem,
		staticBundlesDirectory: `${__dirname}/mock-static-bundles`
	});
});

after(function() {
	rmrf.sync(this.temporaryDirectory);
});
