'use strict';

const fs = require('fs').promises;
const { createEntryFileJavaScript } = require('./createEntryFileJavaScript');
const { parseModulesParameter } = require('./parseModulesParameter');
const util = require('util');
const rimraf = require('rimraf');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleJavascript } = require('./bundleJavascript');

const rmrf = util.promisify(rimraf);

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const createJavaScriptBundle = async (request, response) => {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');

	try {
		console.time('Total time to create JavaScript bundle');
		console.time('parse modules query parameter into an object');
		const modules = parseModulesParameter(request.query.modules);
		console.timeEnd('parse modules query parameter into an object');

		console.time('create package.json file');
		await createPackageJsonFile(bundleLocation, modules);
		console.timeEnd('create package.json file');

		console.time('install dependencies');
		await installDependencies(bundleLocation);
		console.timeEnd('install dependencies');

		console.time('create the js entry file');
		await createEntryFileJavaScript(bundleLocation, modules);
		console.timeEnd('create the js entry file');

		console.time('create the bundle and compile to es5');
		const bundle = await bundleJavascript(bundleLocation);
		console.timeEnd('create the bundle and compile to es5');

		response.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
		response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
		response.status(200);
		response.send(bundle);
		console.timeEnd('Total time to create JavaScript bundle');
	} catch (err) {
		console.error(err, JSON.stringify(err));
		response.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send(`throw new Error(${JSON.stringify(
			'Origami Build Service returned an error: ' + err.message
		)})`);
	} finally {
		await rmrf(bundleLocation);
	}
};

module.exports = {
    createJavaScriptBundle
};
