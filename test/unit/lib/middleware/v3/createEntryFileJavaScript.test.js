'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');
const dedent = require('dedent');
const installDependencies = require('../../../../../lib/middleware/v3/installDependencies').installDependencies;

describe('lib/middleware/v3/createEntryFileJavaScript', () => {
	let createEntryFileJavaScript;

	beforeEach(() => {
		createEntryFileJavaScript = require('../../../../../lib/middleware/v3/createEntryFileJavaScript')
			.createEntryFileJavaScript;
	});

	it('creates a index.js file in the specified location and with the specified components as imported and added to the Origami global variable', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-colors': 'prerelease',
			'@financial-times/o-brand': 'prerelease',
			lodash: '^4',
			preact: '^10.5.5',
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
        import * as preact from "preact";
        import * as lodash from "lodash";
        if (typeof Origami === 'undefined') { self.Origami = {}; }
        self.Origami["lodash"] = lodash;
        self.Origami["preact"] = preact;
        `
		);
	});
	it('creates a index.js file in the specified location and with the specified components as imported, added to the Origami global variable and passed to the callback', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const components = {
			'@financial-times/o-colors': 'prerelease',
			'@financial-times/o-brand': 'prerelease',
			lodash: '^4',
			preact: '^10.5.5',
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
        import * as preact from "preact";
        import * as lodash from "lodash";
        let components = {};
        if (typeof Origami === 'undefined') { self.Origami = {}; }
        self.Origami["lodash"] = lodash;
        components["lodash"] = lodash;
        self.Origami["preact"] = preact;
        components["preact"] = preact;
        typeof start_application === 'function' && start_application(components);
        `
		);
	});
});
