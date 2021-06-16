'use strict';

const buildService = require('./lib/build-service');
const dotenv = require('dotenv');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

dotenv.config({
	silent: true,
});
const options = {
	defaultLayout: 'main',
	httpProxyTtl: 12 * 3600 * 1000,
	installationTtl: 24 * 3600 * 1000,
	installationTtlExact: 3 * 24 * 3600 * 1000,
	log: console,
	metricsAppName: 'origami-build-service',
	name: 'Origami Build Service',
	bowerRegistryURL:
		process.env.BOWER_REGISTRY_URL || 'http://origami-bower-registry.ft.com',
	tempdir: `/tmp/buildservice-${process.pid}/`,
	testHealthcheckFailure: process.env.TEST_HEALTHCHECK_FAILURE || false,
	npmRegistryURL: process.env.NPM_REGISTRY_URL || 'https://registry.npmjs.org'
};

/**
 * This can be sync as it happens during application start-up.
 * The application shouldn't accept connections before it can access all Origami components.
 * This file is needed to access our private Origami components. E.G. o-fonts-assets
 * This code should probably live in moduleinstallation.js
 */
mkdirp.sync(options.tempdir);
const netrcFilePath = path.join(options.tempdir, '/.netrc');
const netrcContents = `machine github.com\nlogin ${process.env.GITHUB_USERNAME}\npassword ${process.env.GITHUB_PASSWORD}`;
fs.writeFileSync(netrcFilePath, netrcContents);
process.env.HOME = options.tempdir; // Workaround: Bower ends up using $HOME/.local/share/bower/empty despite config overriding this

buildService(options)
	.listen()
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
