/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const fs = require('fs').promises;
const path = require('path');

describe.only('installDependencies', () => {
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

	it('it runs `npm install` within the provided location', async () => {
        await fs.mkdir('/tmp/bundle/', {recursive: true});

        const location = await fs.mkdtemp('/tmp/bundle/');
        await fs.writeFile(path.join(location, 'package.json'), '{"dependencies":{"preact":"^10"}}', 'utf-8');

        await installDependencies(location);

        proclaim.isTrue(execa.calledOnce);
        proclaim.isTrue(execa.calledWithExactly('npm',
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
			'--registry="https://origami-npm-registry-prototype.herokuapp.com"'
		],
		{
			cwd: location,
		}));
	});
});
