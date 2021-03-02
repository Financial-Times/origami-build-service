// @ts-nocheck
'use strict';

const fs = require('fs').promises;
const fileExists = require('fs').existsSync;
const util = require('util');
const path = require('path');
const rimraf = require('rimraf');
const Raven = require('raven');
const gracefulFs = require('graceful-fs');

const { parseFontNameParameter } = require('./parseFontNameParameter');
const { parseFontFormatParameter } = require('./parseFontFormatParameter');
const { parseVersionParameter } = require('./parseVersionParameter');
const { parseSystemCodeParameter } = require('./parseSystemCodeParameter');
const { createPackageJsonFile } = require('./createPackageJsonFile');
const { installDependencies } = require('./installDependencies');
const UserError = require('../../utils/usererror');
const ComponentError = require('../../../lib/utils/componentError');

function getFilePath(bundleLocation, module, file, format) {
	const moduleName = Object.keys(module)[0];
	return path.join(bundleLocation, 'node_modules', moduleName, file + '.' + format);
}


const rmrf = util.promisify(rimraf);

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
const outputFont = async (request, response) => {
	await fs.mkdir('/tmp/bundle/', {recursive: true});
	const bundleLocation = await fs.mkdtemp('/tmp/bundle/');
	await fs.mkdir(bundleLocation, {recursive: true});
	try {

		response.startTime('parseVersionParameter');
		const version = parseVersionParameter(request.query.version);
		response.endTime('parseVersionParameter');
		const moduleName = '@financial-times/o-fonts-assets';
		const githubToken = process.env.ORIGAMI_GITHUB_TOKEN;
		const module = {
			[moduleName]: `git+https://${githubToken}:x-oauth-basic@github.com/Financial-Times/o-fonts-assets.git#semver:${version}`
		};

		response.startTime('parseFontNameParameter');
		const fontFileName = parseFontNameParameter(request.query.font_name);
		response.endTime('parseFontNameParameter');

		response.startTime('parseFontFormatParameter');
		const fontFormat = parseFontFormatParameter(request.query.font_format);
		response.endTime('parseFontFormatParameter');

		response.startTime('parseSystemCodeParameter');
		// Even though we do not use the system code we want to ensure
		// the request has one to help us when we need to communicate
		// to any users of this API endpoint.
		await parseSystemCodeParameter(request.query.system_code);
		response.endTime('parseSystemCodeParameter');

		response.startTime('createPackageJsonFile');
		await createPackageJsonFile(bundleLocation, module);
		response.endTime('createPackageJsonFile');

		response.startTime('installDependencies');
		await installDependencies(bundleLocation, request.app.ft.options.npmRegistryURL);
		response.endTime('installDependencies');

		response.setHeader('Cache-Control', 'public, max-age=86400, stale-if-error=604800, stale-while-revalidate=300000');
		const fontFilePath = getFilePath(bundleLocation, module, fontFileName, fontFormat);

		if (fileExists(fontFilePath)) {
			response.sendFile(fontFilePath);
		} else {
			throw new UserError(
				`${moduleName}@${version} does not contain a font named '${fontFileName}' with format '${fontFormat}'.`
			);
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
		response.setHeader('Cache-Control', 'max-age=0, must-revalidate, no-cache, no-store');
		response.status(400);

		response.send(JSON.stringify(
			'Origami Build Service returned an error: ' + err.message
		));
	} finally {
		await rmrf(bundleLocation, rimrafOptions);
	}
};

module.exports = {
	outputFont
};
