'use strict';

const request = require('supertest');
const {assert} = require('chai');

const gone = [
	'/__origami/service/build/bundles/css?modules=o-test-component@1.0.16',
	'/__origami/service/build/v1/bundles/css?modules=o-test-component@1.0.16',

	'/__origami/service/build/bundles/js?modules=o-test-component@1.0.16',
	'/__origami/service/build/v1/bundles/js?modules=o-test-component@1.0.16',

	'/__origami/service/build/modules/o-test-component@1.0.16',
	'/__origami/service/build/v1/modules/o-test-component@1.0.16',

	'/__origami/service/build/modules/not-a-valid-component',
	'/__origami/service/build/v1/modules/not-a-valid-component',

	'/__origami/service/build/files/o-test-component@1.0.13/readme.md',
	'/__origami/service/build/v1/files/o-test-component@1.0.13/readme.md',

	'/__origami/service/build/v3/font?font_name=MillerDisplay-Bold&system_code=$$$-no-bizops-system-code-$$$&font_weight=400&font_style=normal&font_format=woff&version=1.23.0',
	'/__origami/service/build/v3/font?font_name=BentonSans-Bold&system_code=$$$-no-bizops-system-code-$$$&font_weight=400&font_style=normal&font_format=woff&version=1.23.0',
	'/__origami/service/build/v3/font?font_name=BentonSansBook-Regular&system_code=$$$-no-bizops-system-code-$$$&font_weight=400&font_style=normal&font_format=woff&version=1.23.0',

	'/__origami/service/build/v2/files/o-fonts-assets@1.13.0/BentonSans-Bold.woff',
	'/__origami/service/build/v2/files/o-fonts-assets@1.13.0/MillerDisplay-Bold.woff',
	'/__origami/service/build/v2/files/o-fonts-assets@1.13.0/BentonSansBook-Regular.woff',

	'/__origami/service/build/url-updater/',
];

for (const url of gone) {
	describe(`HEAD ${url}`, function() {
		this.timeout(20000);
		this.slow(5000);
		it('returns 410, gone', async function() {
			const response = await request(this.app)
				.head(url)
				.set('Connection', 'close');

			assert.equal(response.status, 410);
		});
	});
}
