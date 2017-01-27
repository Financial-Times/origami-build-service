#!/usr/bin/env node

'use strict';

require('dotenv').load({
	silent: true
});

const process = require('process');
const createApp = require('./lib/index');
const log = require('./lib/utils/log');
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

const config = {
	log: log,
	port: process.env.PORT || 9000,
	export: process.env.export || 'Origami',
	tempdir: tempdir,
	installationTtl: 24 * 3600 * 1000,
	installationTtlExact: 3 * 24 * 3600 * 1000,
	httpProxyTtl: 12 * 3600 * 1000,
	writeAccessLog: true,
	registryURL: process.env.REGISTRY_URL || 'http://registry.origami.ft.com',
	tempdir
};

const app = createApp(config);

app.listen(config.port, function () {
	log.info({
		port: config.port,
		env: process.env.NODE_ENV
	}, 'Started server');
});
