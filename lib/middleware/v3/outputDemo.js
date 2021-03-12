'use strict';

const fs = require('fs').promises;
const gracefulFs = require('graceful-fs');
const Raven = require('raven');
const cheerio = require('cheerio');
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);
const prettier = require('prettier');

const { parseComponentParameter } = require('./parseComponentParameter');
const { installDependencies } = require('./installDependencies');
const { parseBrandParameter } = require('./parseBrandParameter');
const { parseDemoParameter } = require('./parseDemoParameter');
const { downloadAndUnpackPackage } = require('./downloadAndUnpackPackage');
const { buildDemo } = require('./buildDemo');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');
const { isOrigamiV2Component } = require('./isOrigamiV2Component');
const UserError = require('../../../lib/utils/usererror');
const ComponentError = require('../../../lib/utils/componentError');

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

const extractMinimalHtml = (fullHtml) => {
	let formattedHTML;
	try {
		formattedHTML = prettier.format(fullHtml, { parser: 'html' });
	} catch (error) {
		throw new ComponentError('The HTML in the demo contains syntax errors. Error: ' + error.message.split('\n')[0]);
	}
	const $ = cheerio.load(formattedHTML);
	const body = $('body');

	// Find all top-level non-template script and link elements
	const elements = body.find('> script:not([type="text/template"]), > link');

	// Strip script and link elements that reference Origami URLs
	for (const el of elements.toArray()) {
		const element = $(el);
		element.remove();
	}

	// Return the body inner HTML
	const demoHtml = body.html().trim();

	return demoHtml;
};

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const outputDemo = async (request, response) => {
	await fs.mkdir('/tmp/demo/', {recursive: true});
	const demoLocation = await fs.mkdtemp('/tmp/demo/');

	try {
		const [name, version] = await parseComponentParameter(request.query.component);

		await parseSystemCodeParameter(request.query.system_code);

		const brand = parseBrandParameter(request.query.brand);

		const demo = parseDemoParameter(request.query.demo);

		await downloadAndUnpackPackage(demoLocation, name, version, request.app.ft.options.npmRegistryURL);

		if (await isOrigamiV2Component(demoLocation) === false) {
			throw new UserError(`${name}@${version} is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components.`);
		}

		await installDependencies(demoLocation, request.app.ft.options.npmRegistryURL);

		const demoHtml = await buildDemo(demoLocation, brand, demo, name, version);

		if (request.path === '/v3/demo/html') {
			const html = extractMinimalHtml(demoHtml);
			// We are using a content-type of text/plain to ensure that the browser/user-agent
			// which recieves the response does not try and execute it.
			response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
			response.setHeader('X-Content-Type-Options', 'nosniff');
			response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
			response.status(200);
			response.send(html);
		} else {
			response.setHeader('Content-Type', 'text/html;charset=UTF-8');
			response.setHeader('X-Content-Type-Options', 'nosniff');
			response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
			response.status(200);
			response.send(demoHtml);
		}
	} catch (err) {
		if (!(err instanceof UserError || err instanceof ComponentError)) {
			Raven.captureException(err);
			console.error(err, JSON.stringify(err));
		}

		// We are using a content-type of text/plain to ensure that the browser/user-agent
		// which recieves the response does not try and execute it.
		// This protects our error responses from any form of cross-site-scripting (XSS) attack.
		response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
		response.setHeader('X-Content-Type-Options', 'nosniff');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send('Origami Build Service returned an error: ' + JSON.stringify(err.message));
	} finally {
		await rmrf(demoLocation, rimrafOptions);
	}
};

module.exports = {
	outputDemo
};
