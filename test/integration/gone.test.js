'use strict';

const request = require('supertest');
const {assert} = require('chai');

const gone = [
	'/__origami/service/build/modules/o-test-component@1.0.16',
	'/__origami/service/build/v1/modules/o-test-component@1.0.16',

	'/__origami/service/build/modules/not-a-valid-component',
	'/__origami/service/build/v1/modules/not-a-valid-component',

	'/__origami/service/build/files/o-test-component@1.0.13/readme.md',
	'/__origami/service/build/v1/files/o-test-component@1.0.13/readme.md'
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
