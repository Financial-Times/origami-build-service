'use strict';

const fs = require('fs').promises;
const Raven = require('raven');
const cheerio = require('cheerio');
const prettier = require('prettier');
const mem = require('mem');

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
const {urlFromRequest} = require('../../../lib/utils/urlFromRequest');

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
 * @param {String} brand The brand to build the demo for.
 * @param {String} demoName The name of the demo to build.
 * @param {String} componentName The name of the component.
 * @param {String} version The version of the component.
 * @param {string} npmRegistryURL The npm registry to use when downloading the components
 * @returns {Promise<String>} The built demo's HTML.
 */
async function retrieveDemo(brand, demoName, componentName, version, npmRegistryURL) {
	await fs.mkdir('/tmp/demo/', {recursive: true});
	const demoLocation = await fs.mkdtemp('/tmp/demo/');

	await downloadAndUnpackPackage(demoLocation, componentName, version, npmRegistryURL);

	if (await isOrigamiV2Component(demoLocation) === false) {
		throw new UserError(`${componentName}@${version} is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components.`);
	}

	await installDependencies(demoLocation, npmRegistryURL, false);

	const demoHtml = await buildDemo(demoLocation, brand, demoName, componentName, version);
	return demoHtml;
}

const twoMinutes = 120 * 1000;

/**
 * Memoized version of retrieveDemo which keeps the results in an in-memory cache for up to 2 minutes.
 *
 * @param {String} brand The brand to build the demo for.
 * @param {String} demoName The name of the demo to build.
 * @param {String} componentName The name of the component.
 * @param {String} version The version of the component.
 * @param {string} npmRegistryURL The npm registry to use when downloading the components
 * @returns {Promise<String>} The built demo's HTML.
 */
const memoizedRetrieveDemo = mem(retrieveDemo, {
	maxAge: twoMinutes,
	cacheKey: (...args) => {
		return JSON.stringify(args);
	}
});

async function resolveAfter(seconds, value) {
	return new Promise(resolve => setTimeout(() => {
		resolve(value);
	}, seconds * 1000));
}

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const outputDemo = async (request, response) => {

	try {
		response.header('Surrogate-Key', 'origami-build-service-v3-demo');
		// Even though we do not use the system code we want to ensure
		// the request has one to help us when we need to communicate
		// to any users of this API endpoint.
		await parseSystemCodeParameter(request.query.system_code);

		const [name, version] = await parseComponentParameter(request.query.component);
		const brand = parseBrandParameter(request.query.brand);
		const demo = parseDemoParameter(request.query.demo);

		const demoHtml = memoizedRetrieveDemo(brand, demo, name, version, request.app.ft.options.npmRegistryURL);

		const timeout = Symbol();
		const result = await Promise.race([demoHtml, resolveAfter(25, timeout)]);

		if (result === timeout) {
			// Do not cache this response in Fastly or in the browser because it is
			// redirecting to itself merely as a workaround for Heroku's router not
			// allowing request to take longer than 30 seconds to respond.
			response.setHeader('Cache-Control', 'private, no-store');
			response.setHeader('Location', urlFromRequest(request));
			response.status(307);
			response.send();
		} else {
			const demoHtml = result;

			if (request.path === '/v3/demo/html' || request.path === '/__origami/service/build/v3/demo/html') {
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
	}
};

module.exports = {
	outputDemo
};
