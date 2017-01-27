#!/usr/bin/env node
'use strict';

require('dotenv').load({
	silent: true
});

const createApp = require('./lib/index');
const log = require('./lib/utils/log');
const BuildSystem = require('./lib/buildsystem');
const HealthMonitor = require('./lib/monitoring/healthmonitor');
const Registry = require('./lib/registry');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const tempdir = '/tmp/buildservice-' + process.pid + '/';

/**
 * This can be sync as it happens during application start-up.
 * The application shouldn't accept connections before it can access all Origami components.
 * This file is needed to access our private Origami components. E.G. o-fonts-assets
 * This code should probably live in moduleinstallation.js
 */
mkdirp.sync(tempdir);
const filePath = path.join(tempdir, '/.netrc');
const netrc = 'machine github.com\nlogin ' + process.env.GITHUB_USERNAME + '\npassword ' + process.env.GITHUB_PASSWORD;
fs.writeFileSync(filePath, netrc);
process.env.HOME = tempdir; // Workaround: Bower ends up using $HOME/.local/share/bower/empty despite config overriding this

const registry = new Registry();
const healthMonitor = new HealthMonitor({log:log});
const buildSystem = new BuildSystem({
	log: log,
	port: process.env.PORT || 9000,
	export: process.env.export || 'Origami',
	tempdir: tempdir,
	registry: registry,

	installationTtl: 24*3600*1000,
	installationTtlExact: 3*24*3600*1000,
	httpProxyTtl: 12*3600*1000,
});

const app = createApp({
	buildSystem: buildSystem,
	healthMonitor: healthMonitor,
	writeAccessLog: true
});

app.listen(process.env.PORT || 9000, function() {
	log.info({port: process.env.PORT || 9000, env:process.env.NODE_ENV}, 'Started server');
});
