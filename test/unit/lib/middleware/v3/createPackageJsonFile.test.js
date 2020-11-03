'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');

describe('lib/middleware/v3/createPackageJsonFile', () => {
    let createPackageJsonFile;

    beforeEach(() => {
        createPackageJsonFile = require('../../../../../lib/middleware/v3/createPackageJsonFile').createPackageJsonFile;
    });

    it('creates a package.json file in the specified location and with the specified modules as dependencies', async function() {
        await fs.mkdir('/tmp/bundle/', {recursive: true});

        const location = await fs.mkdtemp('/tmp/bundle/');

        const modules = new Map([
            ['lodash', '^5'],
            ['preact', '^10.5.5']
        ]);

        await createPackageJsonFile(location, modules);

        proclaim.deepStrictEqual(await fs.readFile(path.join(location, 'package.json'), 'utf-8'), JSON.stringify({
			dependencies: modules,
		}, undefined, '\t'));

    });

});
