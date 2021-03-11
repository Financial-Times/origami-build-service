'use strict';

const querystring = require('querystring');
const fs = require('fs').promises;
const path = require('path');
const Raven = require('raven');
const mem = require('mem');

const { createEntryFileSass } = require('./createEntryFileSass');
const { parseComponentsParameter } = require('./parseComponentsParameter');
const { parseBrandParameter } = require('./parseBrandParameter');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const { bundleSass } = require('./bundleSass');
const UserError = require('../../../lib/utils/usererror');
const ComponentError = require('../../../lib/utils/componentError');
const { isOrigamiV2Component } = require('./isOrigamiV2Component');

/**
 * @param {Object<string, string>|{}} components A Map where the key is the component name and the value is the version range
 * @param {string} brand The brand to compile the css for. Either "master", "internal", or "whitelabel".
 * @param {string} systemCode The system-code to compile the css for.
 * @param {string} npmRegistryURL The npm registry to use when downloading the components
 * @returns {Promise<String>} The bundled Sass as a string
 */
async function retrieveCssBundle(components, brand, systemCode, npmRegistryURL) {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');
	await fs.mkdir(bundleLocation, {recursive: true});

	await createPackageJsonFile(bundleLocation, components);
	await installDependencies(bundleLocation, npmRegistryURL);

	for (const [name, version] of Object.entries(components)) {
		const location = path.join(bundleLocation, 'node_modules', name);
		if (await isOrigamiV2Component(location) === false) {
			throw new UserError(`${name}@${version} is not an Origami v2 component, the Origami Build Service v3 API only supports Origami v2 components.`);
		}
	}

	await createEntryFileSass(bundleLocation, components, brand, systemCode);
	const bundle = await bundleSass(bundleLocation, 'index.scss', []);

	return bundle;
}

const twoMinutes = 120 * 1000;

/**
 * Memoized version of retrieveCssBundle which keeps the results in an in-memory cache for up to 2 minutes.
 *
 * @param {Object<string, string>|{}} components A Map where the key is the component name and the value is the version range
 * @param {string} brand The brand to compile the css for. Either "master", "internal", or "whitelabel".
 * @param {string} systemCode The system-code to compile the css for.
 * @param {string} npmRegistryURL The npm registry to use when downloading the components
 * @returns {Promise<String>} The bundled Sass as a string
 */
const memoizedRetrieveCssBundle = mem(retrieveCssBundle, {
	maxAge: twoMinutes,
	cacheKey: (...args) => {
		return JSON.stringify(args);
	}
});

function selfURL(req) {
	const qs = querystring.stringify(req.query);
	return path.join(req.basePath, req.path) + (qs ? '?' + qs : '');
}


async function resolveAfter(seconds, value) {
	return new Promise(resolve => setTimeout(() => {
		resolve(value);
	}, seconds * 1000));
}

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
const createCssBundle = async (request, response) => {
	try {
		const components = parseComponentsParameter(request.query.components);
		const brand = parseBrandParameter(request.query.brand);
		const systemCode = await parseSystemCodeParameter(request.query.system_code);

		const bundle = memoizedRetrieveCssBundle(components, brand, systemCode, request.app.ft.options.npmRegistryURL);

		const timeout = Symbol();
		const result = await Promise.race([bundle, resolveAfter(25, timeout)]);

		if (result === timeout) {
			// Do not cache this response in Fastly or in the browser because it is
			// redirecting to itself merely as a workaround for Heroku's router not
			// allowing request to take longer than 30 seconds to respond.
			response.setHeader('Cache-Control', 'private, no-store');
			response.redirect(307, selfURL(request));
		} else {
			const bundle = result;
			response.setHeader('Content-Type', 'text/css; charset=UTF-8');
			response.setHeader('X-Content-Type-Options', 'nosniff');
			response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
			response.status(200);
			response.send(bundle);
		}
	} catch (err) {
		if (!(err instanceof UserError || err instanceof ComponentError)) {
			Raven.captureException(err);
			console.error(err, JSON.stringify(err));
		}

		// We are using a content-type of text/plain to ensure that the browser/user-agent
		// which recieves the response does not try and execute it.
		// This protects our error responses from any form of cross-site-scripting (XSS) attack.
		response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
		response.setHeader('X-Content-Type-Options', 'nosniff');
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send('Origami Build Service returned an error: ' + JSON.stringify(err.message));
	}
};

module.exports = {
	createCssBundle
};
