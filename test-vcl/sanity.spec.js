'use strict';

require('dotenv').config({
	silent: true
});

const supertest = require('supertest-as-promised');
const urls = require('./helpers/url');
const host = urls.host;
const homePage = urls.home;
const proclaim = require('proclaim');

describe('Sanity check', () => {

	it('responds with 200 when hitting homepage', () => {
		return supertest(host)
			.get(homePage)
			.expect(200)
			.expect('Content-Type', /html/)
			.expect(function(res) {
				proclaim.include(res.text, '<title>Origami Build Service</title>');
      });
	});

});