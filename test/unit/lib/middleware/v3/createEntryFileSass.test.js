'use strict';

const fs = require('fs').promises;
const path = require('path');
const proclaim = require('proclaim');
const dedent = require('dedent');

describe('lib/middleware/v3/createEntryFileSass', () => {
	const createEntryFileSass = require('../../../../../lib/middleware/v3/createEntryFileSass').createEntryFileSass;

	it('creates a index.scss file in the specified location and with the specified brand and modules as imported and their primary mixin used', async function () {
		await fs.mkdir('/tmp/bundle/', {recursive: true});

		const location = await fs.mkdtemp('/tmp/bundle/');

		const modules = {
			'@financial-times/o-table': '100.0.0-11',
			'@financial-times/o-grid': '100.0.0-11',
		};

		const brand = 'master';
		const systemCode = 'origami';

		await createEntryFileSass(location, modules, brand, systemCode);

		const EntryFileContents = await fs.readFile(
			path.join(location, 'index.scss'),
			'utf-8'
		);
		proclaim.deepStrictEqual(
			EntryFileContents,
			dedent`
                $o-brand: "master";
                $system-code: "origami";

                @import "@financial-times/o-grid";
                @include oGrid();
                @import "@financial-times/o-table";
                @include oTable();`
		);
	});
});
