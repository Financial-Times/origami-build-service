/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const fs = require('fs').promises;
const path = require('path');
const appRoot = require('app-root-path');
const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');
const npmCacheLocation = path.join(appRoot.toString(), './.npm-cache');

describe('installDependencies', () => {
	let installDependencies;
	let execa;

	beforeEach(function() {
		execa = sinon.stub();
		execa.command = sinon.stub().resolves();
		mockery.registerMock('execa', execa);
		installDependencies = require('../../../../../lib/middleware/v3/installDependencies').installDependencies;
	});

	it('it is a function', async () => {
		proclaim.isFunction(installDependencies);
	});

	it('it runs `npm install` within the provided location and with the default registry', async () => {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');
		await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"@financial-times/o-table":"9.0.2"}}', 'utf-8');

		await installDependencies(location);

		proclaim.isTrue(execa.command.calledOnce);
		proclaim.isTrue(execa.command.calledWithExactly(
			`${npm} install --offline --production --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=https://registry.npmjs.org/ --cache=${npmCacheLocation}`,
			{
				cwd: location,
				preferLocal: false,
				shell: true,
			}));
	});

	it('it runs `npm install` within the provided location and with the provided registry', async () => {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');
		await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"@financial-times/o-table":"9.0.2"}}', 'utf-8');
		const registry = 'https://registry.npmjs.org';
		await installDependencies(location, registry);

		proclaim.isTrue(execa.command.calledOnce);
		proclaim.isTrue(execa.command.calledWithExactly(
			`${npm} install --offline --production --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=${registry} --cache=${npmCacheLocation}`,
			{
				cwd: location,
				preferLocal: false,
				shell: true,
			}));
	});

	it('if `npm install` fails, it runs `npm install` again but this time allowing network requests to be made', async () => {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');
		await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"@financial-times/o-table":"9.0.2"}}', 'utf-8');
		
		// Mimic the first call to npm failing and the second call succeeding
		execa.command.onFirstCall().rejects().onSecondCall().resolves();

		await installDependencies(location);

		proclaim.isTrue(execa.command.calledTwice);
		proclaim.isTrue(execa.command.firstCall.calledWithExactly(
			`${npm} install --offline --production --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=https://registry.npmjs.org/ --cache=${npmCacheLocation}`,
			{
				cwd: location,
				preferLocal: false,
				shell: true,
			}));
		proclaim.isTrue(execa.command.secondCall.calledWithExactly(
			`${npm} install --prefer-offline --production --ignore-scripts --no-package-lock --no-audit --progress=false --fund=false --package-lock=false --strict-peer-deps --update-notifier=false --bin-links=false --registry=https://registry.npmjs.org/ --cache=${npmCacheLocation}`,
			{
				cwd: location,
				preferLocal: false,
				shell: true,
			}));
	});
});
