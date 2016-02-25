'use strict';

// Slightly nasty hack to suppress Graphite warning logs
process.env.GRAPHITE_HOST = 'localhost';

const BuildSystem = require('../../lib/buildsystem');
const createApp = require('../../lib');
const log = require('../../lib/utils/log');
const mkdirp = require('mkdirp');
const rmrf = require('rimraf');
const uuid = require('uuid');

before(function() {
	this.temporaryDirectory = `/tmp/buildservice/tests-${uuid()}`;
	mkdirp.sync(this.temporaryDirectory);
	this.buildSystem = new BuildSystem({
		log: log,
		tempdir: this.temporaryDirectory,
		whitelist: '*'
	});
	this.app = createApp({
		buildSystem: this.buildSystem
	});
});

after(function() {
	rmrf.sync(this.temporaryDirectory);
});
