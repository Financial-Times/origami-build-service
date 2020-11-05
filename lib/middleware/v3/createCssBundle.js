'use strict';

const fs = require('fs').promises;
const { createEntryFileSass } = require('./createEntryFileSass');
const { parseModulesParameter } = require('./parseModulesParameter');
const util = require('util');
const rimraf = require('rimraf');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleSass } = require('./bundleSass');
const Raven = require('raven');
const rmrf = util.promisify(rimraf);
const gracefulFs = require('graceful-fs');

const rimrafOptions = {
	glob: false,
	unlink: gracefulFs.unlink,
	unlinkSync: gracefulFs.unlinkSync,
	chmod: gracefulFs.chmod,
	chmodSync: gracefulFs.chmodSync,
	stat: gracefulFs.stat,
	statSync: gracefulFs.statSync,
	lstat: gracefulFs.lstat,
	lstatSync: gracefulFs.lstatSync,
	rmdir: gracefulFs.rmdir,
	rmdirSync: gracefulFs.rmdirSync,
	readdir: gracefulFs.readdir,
	readdirSync: gracefulFs.readdirSync
};

/**
 * @param {import('express/lib/request')} request
 * @param {import('express/lib/response')} response
 */
const createCssBundle = async (request, response) => {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');

	try {
		const modules = parseModulesParameter(request.query.modules);

		await fs.mkdir(bundleLocation, {recursive: true});

		await createPackageJsonFile(bundleLocation, modules);

		await installDependencies(bundleLocation);

		await createEntryFileSass(bundleLocation, modules);

		const bundle = await bundleSass(bundleLocation);

		response.setHeader('Content-Type', 'text/css; charset=UTF-8');
		response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
		response.status(200);
		response.send(bundle);
	} catch (err) {
		Raven.captureException(err);
		console.error(err, JSON.stringify(err));

		response.setHeader('Content-Type', 'text/css; charset=UTF-8');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send(`/*${JSON.stringify(
			'Origami Build Service returned an error: ' + err.message
		)}*/`);
	} finally {
		await rmrf(bundleLocation, rimrafOptions);
	}
};

module.exports = {
    createCssBundle
};
