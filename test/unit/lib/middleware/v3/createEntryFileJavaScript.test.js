'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');
const dedent = require('dedent');
describe('lib/middleware/v3/createEntryFileJavaScript', () => {
	let createEntryFileJavaScript;

	beforeEach(() => {
		createEntryFileJavaScript = require('../../../../../lib/middleware/v3/createEntryFileJavaScript')
			.createEntryFileJavaScript;
	});

	it('creates a index.js file in the specified location and with the specified modules as imported and added to the Origami global variable', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const modules = {
			lodash: '^5',
			preact: '^10.5.5',
		};

		await createEntryFileJavaScript(location, modules);

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
});
