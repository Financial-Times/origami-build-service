'use strict';

const request = require('supertest');
const proclaim = require('proclaim');

describe('GET /__about', function () {
	this.timeout(20000);
	this.slow(5000);

	beforeEach(function () {
		this.request = request(this.app)
			.get('/__about')
			.set('Connection', 'close');
	});

	it('should respond with a 200 status', function (done) {
		this.request.expect(200).end(done);
	});

	it('should respond with UTF-8 JSON', function (done) {
		this.request.expect('Content-Type', 'application/json; charset=utf-8').end(done);
	});

	it('should contain about data', function (done) {
		this.request.expect(function (res) {
			proclaim.equal(res.body.schemaVersion, 1);
			proclaim.equal(res.body.name, 'build-service');
			proclaim.equal(res.body.systemCode, 'build-service');
			proclaim.equal(res.body.purpose, 'Front end build process as a service.  Fetches specified Origami components from git, runs Origami build process, and returns the resulting CSS or JS bundle over HTTP.');
			proclaim.equal(res.body.audience, 'public');
			proclaim.equal(res.body.primaryUrl, 'https://www.ft.com/__origami/service/build/');
			proclaim.equal(res.body.serviceTier, 'gold');
			proclaim.equal(res.body.apiVersion, 2);
			proclaim.deepEqual(res.body.apiVersions, [{
						path: '/v1',
						supportStatus: 'deprecated',
						dateTerminated: '2016-01-08T12:00:00Z'
					},
					{
						path: '/v2',
						supportStatus: 'active'
					}
				]);
			proclaim.deepEqual(res.body.dateCreated, '2013-11-05');
			proclaim.deepEqual(res.body.contacts, [{
					name: 'Origami team',
					email: 'origami.support@ft.com',
					rel: 'owner',
					domain: 'All support enquiries'
				}]);
			proclaim.deepEqual(res.body.links, [{
						url: 'https://github.com/Financial-Times/origami-build-service/issues',
						category: 'issues'
					},
					{
						url: 'https://github.com/Financial-Times/origami-build-service',
						category: 'repo'
					},
					{
						url: 'https://dashboard.heroku.com/apps/origami-build-service-eu',
						category: 'deployment',
						description: 'Production Heroku app control panel'
					},
					{
						url: 'https://dashboard.heroku.com/apps/origami-build-service-qa',
						category: 'deployment',
						description: 'QA Heroku app control panel'
					},
					{
						url: 'http://grafana.ft.com/dashboard/db/origami-build-service',
						category: 'monitoring',
						description: 'Grafana dashboard'
					},
					{
						url: 'https://control.akamai.com/platformtoolkit/web/main/app?accountId=F-AC-1813198&gid=59378&tab=HOME&pid=buildservice.ft.com&aid=6288829&redirected=1449135292518&cs=app#',
						category: 'deployment',
						description: 'Akamai CDN control panel'
					},
					{
						url: 'https://my.pingdom.com/reports/uptime#check=1299983',
						category: 'monitoring',
						description: 'Pingdom check'
					},
					{
						url: 'https://docs.google.com/drawings/d/1khB3K5pwVPRMW5DcLB0o3bMkh__-896mS4hcVQS72f4/edit',
						category: 'documentation',
						description: 'Architecture diagram'
					},
					{
						url: 'https://github.com/Financial-Times/origami-build-service#readme',
						category: 'documentation',
						description: 'README'
					},
					{
						url: 'https://app.getsentry.com/nextftcom/build-service-prod/',
						category: 'monitoring',
						description: 'Runtime errors dashboard via Sentry'
					}
				]);
			proclaim.deepEqual(res.body.appVersion, '3.9.0');
		}).end(done);
	});

});
