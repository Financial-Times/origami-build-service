// @ts-nocheck
'use strict';

const fs = require('fs').promises;
const fileExists = require('fs').existsSync;
const path = require('path');
const Raven = require('raven');
const mem = require('mem');

const { parseFontNameParameter } = require('./parseFontNameParameter');
const { parseFontFormatParameter } = require('./parseFontFormatParameter');
const { parseVersionParameter } = require('./parseVersionParameter');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const UserError = require('../../utils/usererror');
const ComponentError = require('../../../lib/utils/componentError');
const { urlFromRequest } = require('../../../lib/utils/urlFromRequest');
const isFontDeprecated = require("../../utils/isFontDeprecated");

function getFilePath(bundleLocation, component, file, format) {
	const componentName = Object.keys(component)[0];
	return path.join(bundleLocation, 'node_modules', componentName, file + '.' + format);
}

/**
 * Download the `@financial-times/o-fonts-assets` package from the given npm registry at the given version and return the path
 * to the given font file.
 *
 * @param {string} version The version of `@financial-times/o-fonts-assets` to download
 * @param {string} fontFileName The name of the font file to retrieve from `@financial-times/o-fonts-assets`
 * @param {string} fontFormat The format of the font file to retrieve from `@financial-times/o-fonts-assets`
 * @param {string} npmRegistryURL The npm registry to use when downloading `@financial-times/o-fonts-assets`
 * @returns {Promise<string>} The path on the filesystem to the requested font.
 */
async function retrieveFont(version, fontFileName, fontFormat, npmRegistryURL) {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');
	await fs.mkdir(bundleLocation, {recursive: true});
	const componentName = '@financial-times/o-fonts-assets';
	const githubToken = process.env.ORIGAMI_GITHUB_TOKEN;
	const component = {
		[componentName]: `git+https://${githubToken}:x-oauth-basic@github.com/Financial-Times/o-fonts-assets.git#semver:${version}`
	};
	await createPackageJsonFile(bundleLocation, component);

	await installDependencies(bundleLocation, npmRegistryURL);
	const fontFilePath = getFilePath(bundleLocation, component, fontFileName, fontFormat);

	if (fileExists(fontFilePath)) {
		return fontFilePath;
	} else {
		throw new UserError(`${componentName}@${version} does not contain a font named '${fontFileName}' with format '${fontFormat}'.`);
	}
}

const twoMinutes = 120 * 1000;

/**
 * Memoized version of retrieveFont which keeps the results in an in-memory cache for up to 2 minutes.
 *
 * @param {string} version The version of `@financial-times/o-fonts-assets` to download
 * @param {string} fontFileName The name of the font file to retrieve from `@financial-times/o-fonts-assets`
 * @param {string} fontFormat The format of the font file to retrieve from `@financial-times/o-fonts-assets`
 * @param {string} npmRegistryURL The npm registry to use when downloading `@financial-times/o-fonts-assets`
 * @returns {Promise<string>} The path on the filesystem to the requested font.
 */
const memoizedRetrieveFont = mem(retrieveFont, {
	maxAge: twoMinutes, cacheKey: (...args) => {
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
const outputFont = async (request, response) => {
	try {
		response.header('Surrogate-Key', 'origami-build-service-v3-font');
		// Even though we do not use the system code we want to ensure
		// the request has one to help us when we need to communicate
		// to any users of this API endpoint.
		await parseSystemCodeParameter(request.query.system_code);

		const version = parseVersionParameter(request.query.version);
		const fontFileName = parseFontNameParameter(request.query.font_name);
		const fontFormat = parseFontFormatParameter(request.query.font_format);

		if (isFontDeprecated(fontFileName)) {
			// We are using a content-type of text/plain to ensure that the browser/user-agent
			// which recieves the response does not try and execute it.
			// This protects our error responses from any form of cross-site-scripting (XSS) attack.
			response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
			response.setHeader('X-Content-Type-Options', 'nosniff');
			response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
			response.status(410);

			response.send(JSON.stringify(`Origami Build Service returned an error: The font '${fontFileName}' is deprecated.`));
			return;
		}

		const fontFilePath = memoizedRetrieveFont(version, fontFileName, fontFormat, request.app.ft.options.npmRegistryURL);

		const timeout = Symbol();
		const result = await Promise.race([fontFilePath, resolveAfter(25, timeout)]);

		if (result === timeout) {
			// Do not cache this response in Fastly or in the browser because it is
			// redirecting to itself merely as a workaround for Heroku's router not
			// allowing request to take longer than 30 seconds to respond.
			response.setHeader('Cache-Control', 'private, no-store');
			response.setHeader('Location', urlFromRequest(request));
			response.status(307);
			response.send();
		} else {
			const fontFilePath = result;
			response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
			response.sendFile(fontFilePath);
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

		response.send(JSON.stringify('Origami Build Service returned an error: ' + err.message));
	}
};
module.exports = {
	outputFont
};
