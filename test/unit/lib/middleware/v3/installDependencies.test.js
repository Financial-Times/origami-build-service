/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const fs = require('fs').promises;
const path = require('path');

describe('installDependencies', () => {
	let installDependencies;
	let execa;

	beforeEach(function() {
		execa = sinon.spy();
		mockery.registerMock('execa', execa);
		installDependencies = require('../../../../../lib/middleware/v3/installDependencies').installDependencies;
	});

	it('it is a function', async () => {
		proclaim.isFunction(installDependencies);
	});

	it('it runs `npm install` within the provided location and with the default registry', async () => {
		const appRoot = require('app-root-path');

		const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');
		await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"preact":"^10"}}', 'utf-8');

		await installDependencies(location);

		proclaim.isTrue(execa.calledOnce);
		proclaim.isTrue(execa.calledWithExactly(npm,
			[
				'install',
				'--production',
				'--ignore-scripts',
				'--no-package-lock',
				'--no-audit',
				'--prefer-offline',
				'--progress=false',
				'--fund=false',
				'--package-lock=false',
				'--strict-peer-deps',
				'--update-notifier=false',
				'--bin-links=false',
				'--registry=https://registry.npmjs.org/'
			],
			{
				cwd: location,
				preferLocal: true
			}));
	});

	it('it runs `npm install` within the provided location and with the provided registry', async () => {
		const appRoot = require('app-root-path');

		const npm = path.join(appRoot.toString(), './node_modules/.bin/npm');
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');
		await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"preact":"^10"}}', 'utf-8');

		await installDependencies(location, 'https://registry.npmjs.com');

		proclaim.isTrue(execa.calledOnce);
		proclaim.isTrue(execa.calledWithExactly(npm,
			[
				'install',
				'--production',
				'--ignore-scripts',
				'--no-package-lock',
				'--no-audit',
				'--prefer-offline',
				'--progress=false',
				'--fund=false',
				'--package-lock=false',
				'--strict-peer-deps',
				'--update-notifier=false',
				'--bin-links=false',
				'--registry=https://registry.npmjs.com'
			],
			{
				cwd: location,
				preferLocal: true
			}));
	});
});
