'use strict';

const fs = require('fs').promises;
const { createEntryFileSass } = require('./createEntryFileSass');
const { parseModulesParameter } = require('./parseModulesParameter');
const { parseBrandParameter } = require('./parseBrandParameter');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');
const util = require('util');
const rimraf = require('rimraf');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleSass } = require('./bundleSass');
const Raven = require('raven');
const rmrf = util.promisify(rimraf);
const gracefulFs = require('graceful-fs');
const UserError = require('../../../lib/utils/usererror');

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
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const createCssBundle = async (request, response) => {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');
	await fs.mkdir(bundleLocation, {recursive: true});

	try {

		response.startTime('parseModulesParameter');
		const modules = parseModulesParameter(request.query.modules);
		response.endTime('parseModulesParameter');

		response.startTime('parseBrandParameter');
		const brand = parseBrandParameter(request.query.brand);
		response.endTime('parseBrandParameter');

		response.startTime('parseSystemCodeParameter');
		const systemCode = await parseSystemCodeParameter(request.query.system_code);
		response.endTime('parseSystemCodeParameter');

		response.startTime('createPackageJsonFile');
		await createPackageJsonFile(bundleLocation, modules);
		response.endTime('createPackageJsonFile');

		response.startTime('installDependencies');
		await installDependencies(bundleLocation, request.app.ft.options.npmRegistryURL);
		response.endTime('installDependencies');

		response.startTime('createEntryFileSass');
		await createEntryFileSass(bundleLocation, modules, brand, systemCode);
		response.endTime('createEntryFileSass');

		response.startTime('bundleSass');

		const bundle = await bundleSass(bundleLocation, 'index.scss', []);
		response.endTime('bundleSass');

		response.setHeader('Content-Type', 'text/css; charset=UTF-8');
		response.setHeader('X-Content-Type-Options', 'nosniff');
		response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
		response.status(200);
		response.send(bundle);
	} catch (err) {
		if (!(err instanceof UserError)) {
			Raven.captureException(err);
			console.error(err, JSON.stringify(err));
		}

		response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
		response.setHeader('X-Content-Type-Options', 'nosniff');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send('Origami Build Service returned an error: ' + JSON.stringify(err.message));
	} finally {
		await rmrf(bundleLocation, rimrafOptions);
	}
};

module.exports = {
	createCssBundle
};
