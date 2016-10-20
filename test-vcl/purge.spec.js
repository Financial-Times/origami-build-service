'use strict';

require('dotenv').config({
  silent: true
});
const supertest = require('supertest-as-promised');
const urls = require('./helpers/url');
const host = urls.host;
const homePage = urls.home;
const key = process.env.FASTLY_APIKEY;

describe('Purging', () => {

  it('responds with 400 if PURGE is attempted without API key', () => {
    return supertest(host)
      .purge(homePage)
      .expect(400);
  });

  it('responds with 200 if PURGE is attempted with API key', () => {
    return supertest(host)
      .purge(homePage)
      .set('Fastly-Key', key)
      .expect(200)
      .expect((res) => {
        if (res.body.status !== 'ok') {
          throw new Error('status key was not ok');
        };
      });
  });

});