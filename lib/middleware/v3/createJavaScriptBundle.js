'use strict';

const fs = require('fs').promises;
const gracefulFs = require('graceful-fs');
const util = require('util');
const rimraf = require('rimraf');
const Raven = require('raven');
const rmrf = util.promisify(rimraf);

const { createEntryFileJavaScript } = require('./createEntryFileJavaScript');
const { parseModulesParameter } = require('./parseModulesParameter');
const { parseCallbackParameter } = require('./parseCallbackParameter');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleJavascript } = require('./bundleJavascript');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');

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
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');

	try {
		response.startTime('parseModulesParameter');
		const modules = await parseModulesParameter(request.query.modules);
		response.endTime('parseModulesParameter');

		response.startTime('parseCallbackParameter');
		const callback = await parseCallbackParameter(request.query.callback);
		response.endTime('parseCallbackParameter');

		response.startTime('parseSystemCodeParameter');
		await parseSystemCodeParameter(request.query.system_code);
		response.endTime('parseSystemCodeParameter');

		response.startTime('createPackageJsonFile');
		await createPackageJsonFile(bundleLocation, modules);
		response.endTime('createPackageJsonFile');

		response.startTime('installDependencies');
		await installDependencies(bundleLocation, request.app.ft.options.npmRegistryURL);
		response.endTime('installDependencies');

		response.startTime('createEntryFileJavaScript');
		await createEntryFileJavaScript(bundleLocation, modules, callback);
		response.endTime('createEntryFileJavaScript');

		response.startTime('bundleJavascript');
		const bundle = await bundleJavascript(bundleLocation);
		response.endTime('bundleJavascript');

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
	}
};

module.exports = {
    createJavaScriptBundle
};
