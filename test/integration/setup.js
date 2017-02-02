'use strict';

const buildService = require('../../lib');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

const tempdir = `/tmp/buildservice/tests-${uuid()}`;

before(function() {
	mkdirp.sync(tempdir);

	this.app = buildService({
		tempdir,
		staticBundlesDirectory: `${__dirname}/mock-static-bundles`
	});
});

after(function() {
	rmrf.sync(tempdir);
});
