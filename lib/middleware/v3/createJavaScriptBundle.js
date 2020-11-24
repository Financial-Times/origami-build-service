'use strict';

const fs = require('fs').promises;
const { createEntryFileJavaScript } = require('./createEntryFileJavaScript');
const { parseModulesParameter } = require('./parseModulesParameter');
const util = require('util');
const rimraf = require('rimraf');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleJavascript } = require('./bundleJavascript');
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
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const createJavaScriptBundle = async (request, response) => {
	console.time('createJavaScriptBundle');
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');

	try {
		console.time('parseModulesParameter');
		const modules = parseModulesParameter(request.query.modules);
		console.timeEnd('parseModulesParameter');

		console.time('createPackageJsonFile');
		await createPackageJsonFile(bundleLocation, modules);
		console.timeEnd('createPackageJsonFile');

		console.time('installDependencies');
		await installDependencies(bundleLocation);
		console.timeEnd('installDependencies');

		console.time('createEntryFileJavaScript');
		await createEntryFileJavaScript(bundleLocation, modules);
		console.timeEnd('createEntryFileJavaScript');

		console.time('bundleJavascript');
		const bundle = await bundleJavascript(bundleLocation);
		console.timeEnd('bundleJavascript');

		response.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
		response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
		response.status(200);
		response.send(bundle);
	} catch (err) {
		Raven.captureException(err);
		console.error(err, JSON.stringify(err));

		response.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send(`throw new Error(${JSON.stringify(
			'Origami Build Service returned an error: ' + err.message
		)})`);
	} finally {
		await rmrf(bundleLocation, rimrafOptions);
		console.timeEnd('createJavaScriptBundle');
	}
};

module.exports = {
    createJavaScriptBundle
};
