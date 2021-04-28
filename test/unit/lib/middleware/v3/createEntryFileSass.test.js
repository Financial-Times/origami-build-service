'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');
const dedent = require('dedent');
const installDependencies = require('../../../../../lib/middleware/v3/installDependencies').installDependencies;

describe('lib/middleware/v3/createEntryFileSass', function() {
	this.timeout(20 * 1000);
	const createEntryFileSass = require('../../../../../lib/middleware/v3/createEntryFileSass').createEntryFileSass;

	it('creates a index.scss file in the specified location and with the specified brand and components as imported and their primary mixin used', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-table': 'prerelease',
			'@financial-times/o-grid': 'prerelease'
		};

		await fs.writeFile(path.join(location, 'package.json'), JSON.stringify({
			dependencies: components
		}));

		await installDependencies(location);

		const brand = 'master';
		const systemCode = 'origami';

		await createEntryFileSass(location, components, brand, systemCode);

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.scss'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
                $o-brand: "master";
                $system-code: "origami";

                @import "@financial-times/o-grid/main";
                @if not mixin-exists('oGrid') {
                    @error 'Could not compile sass as @financial-times/o-grid does not have a primary mixin. ' +
                    'If you think this is an issue, please contact the Origami community on Slack in #origami-support. ' +
                    'If you want to learn more about what a primary mixin is, here is a link to the specification -- https://origami.ft.com/spec/v2/components/sass/#primary-mixin';
                }
                @include oGrid();
                @import "@financial-times/o-table/main";
                @if not mixin-exists('oTable') {
                    @error 'Could not compile sass as @financial-times/o-table does not have a primary mixin. ' +
                    'If you think this is an issue, please contact the Origami community on Slack in #origami-support. ' +
                    'If you want to learn more about what a primary mixin is, here is a link to the specification -- https://origami.ft.com/spec/v2/components/sass/#primary-mixin';
                }
                @include oTable();`
		);
	});
	it('does not import a component in the index.scss file if the component has no sass', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-table': 'prerelease',
			'@financial-times/o-grid': 'prerelease',
			'preact': '^10.5.5'
		};

		await fs.writeFile(path.join(location, 'package.json'), JSON.stringify({
			dependencies: components
		}));

		await installDependencies(location);

		const brand = 'master';
		const systemCode = 'origami';

		await createEntryFileSass(location, components, brand, systemCode);

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.scss'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
                $o-brand: "master";
                $system-code: "origami";

                @import "@financial-times/o-grid/main";
                @if not mixin-exists('oGrid') {
                    @error 'Could not compile sass as @financial-times/o-grid does not have a primary mixin. ' +
                    'If you think this is an issue, please contact the Origami community on Slack in #origami-support. ' +
                    'If you want to learn more about what a primary mixin is, here is a link to the specification -- https://origami.ft.com/spec/v2/components/sass/#primary-mixin';
                }
                @include oGrid();
                @import "@financial-times/o-table/main";
                @if not mixin-exists('oTable') {
                    @error 'Could not compile sass as @financial-times/o-table does not have a primary mixin. ' +
                    'If you think this is an issue, please contact the Origami community on Slack in #origami-support. ' +
                    'If you want to learn more about what a primary mixin is, here is a link to the specification -- https://origami.ft.com/spec/v2/components/sass/#primary-mixin';
                }
                @include oTable();`
		);
	});
});
