/* eslint-env mocha */
'use strict';

const proclaim = require('proclaim');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const rimraf = require('rimraf');
const rmrf = util.promisify(rimraf);

describe('bundleSass', () => {
	let bundleSass;

	beforeEach(function () {
		bundleSass = require('../../../../../lib/middleware/v3/bundleSass')
			.bundleSass;
	});

	it('it is a function', async () => {
		proclaim.isFunction(bundleSass);
	});

    context('given valid sass', () => {
        context(
            'a file is imported from within the node_modules folder', () => {
                let location;
                beforeEach(async () => {
                    await fs.mkdir('/tmp/bundle/', {recursive: true});
                    location = await fs.mkdtemp('/tmp/bundle/');
                    await fs.mkdir(path.join(location, 'node_modules/secret'), {recursive: true});

                    await fs.writeFile(
                        path.join(location, 'index.scss'),
                        '@import "secret"; * {color: red}',
                        'utf-8'
                    );
                    await fs.writeFile(
                        path.join(location, 'node_modules/secret/_index.scss'),
                        '.secret {color: pink}',
                        'utf-8'
                    );
                });

                afterEach(async () => {
                    await rmrf(location);
                });

                it('it bundles and compiles the index.scss file in the provided folder location and returns it as a string', async () => {
                    const bundledJavaScript = await bundleSass(location);
                    proclaim.deepStrictEqual(
                        bundledJavaScript,
                        '.secret{color:pink}*{color:red}\n'
                    );
                });
            }
        );
    });

    context('given invalid sass', () => {
        context(
            'a file is imported from within the node_modules folder', () => {
                let location;
                beforeEach(async () => {
                    await fs.mkdir('/tmp/bundle/', {recursive: true});
                    location = await fs.mkdtemp('/tmp/bundle/');
                    await fs.mkdir(path.join(location, 'node_modules/secret'), {recursive: true});

                    await fs.writeFile(
                        path.join(location, 'index.scss'),
                        '@import "secret"; * {color: red}',
                        'utf-8'
                    );
                    await fs.writeFile(
                        path.join(location, 'node_modules/secret/_index.scss'),
                        '@import "magic";',
                        'utf-8'
                    );
                });

                afterEach(async () => {
                    await rmrf(location);
                });

                it('it throws an error', async () => {
                    try {
                        await bundleSass(location);
                        proclaim.notOk('Expected function to throw but it did not.');
                    } catch (err) {
                        proclaim.isInstanceOf(err, Error);
                    }
                });
            }
        );
    });
});
