'use strict';

const buildService = require('../../lib');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

const tempdir = `/tmp/buildservice/tests-${uuid()}`;

before(function() {

	// This overrides the Bower shorthand resolve, which allows us to
	// refer to `mock-modules/<name>` in all of the tests. Bower will
	// look on the local file-system instead of trying to load modules
	// from GitHub or the registry.
	process.env.bower_shorthand_resolver = `${__dirname}/{{shorthand}}`;

	mkdirp.sync(tempdir);

	this.app = buildService({
		tempdir,
		staticBundlesDirectory: `${__dirname}/mock-static-bundles`
	});
});

after(function() {
	rmrf.sync(tempdir);
});
