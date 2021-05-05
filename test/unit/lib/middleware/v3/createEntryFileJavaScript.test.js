'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');
const dedent = require('dedent');
const installDependencies = require('../../../../../lib/middleware/v3/installDependencies').installDependencies;

describe('lib/middleware/v3/createEntryFileJavaScript', function () {
	this.timeout(30 * 1000);
	let createEntryFileJavaScript;

	beforeEach(() => {
		createEntryFileJavaScript = require('../../../../../lib/middleware/v3/createEntryFileJavaScript')
			.createEntryFileJavaScript;
	});

	it('creates a index.js file in the specified location and with the specified components as imported and added to the Origami global variable', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-table': 'prerelease',
		};

		await fs.writeFile(path.join(location, 'package.json'), JSON.stringify({
			dependencies: components
		}));

		await installDependencies(location);

		await createEntryFileJavaScript(location, components);

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.js'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
        import * as oTable from "@financial-times/o-table";
        if (typeof Origami === 'undefined') { self.Origami = {}; }
        self.Origami["o-table"] = oTable;
        `
		);
	});

	it('does not import components in the index.js if they do not export javascript', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-brand': 'prerelease',
		};

		await fs.writeFile(path.join(location, 'package.json'), JSON.stringify({
			dependencies: components
		}));

		await installDependencies(location);

		await createEntryFileJavaScript(location, components);

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.js'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
        if (typeof Origami === 'undefined') { self.Origami = {}; }
        `
		);
	});

	it('creates a index.js file in the specified location and with the specified components as imported, added to the Origami global variable and passed to the callback', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-table': 'prerelease',
			'@financial-times/o-brand': 'prerelease'
		};

		await fs.writeFile(path.join(location, 'package.json'), JSON.stringify({
			dependencies: components
		}));

		await installDependencies(location);

		await createEntryFileJavaScript(location, components, 'start_application');

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.js'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
        import * as oTable from "@financial-times/o-table";
        let components = {};
        if (typeof Origami === 'undefined') { self.Origami = {}; }
        self.Origami["o-table"] = oTable;
        components["o-table"] = oTable;
        typeof start_application === 'function' && start_application(components);
        `
		);
	});
});
