# Origami Build Service [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]

Use the Origami Build Service to include [Origami components](https://origami.ft.com/) in your project with a `<script>` and `<style>` tag, no build step required.

To learn more about using the Origami Build Service refer to the [API reference][production-url] and [Origami Build Service Tutorial][tutorial].

## Table Of Contents

* [Requirements](#requirements)
* [Running Locally](#running-locally)
* [Configuration](#configuration)
* [Testing](#testing)
* [Deployment](#deployment)
* [Monitoring](#monitoring)
* [Trouble-Shooting](#trouble-shooting)
* [License](#license)


## Requirements

Running Origami Build Service requires [Node.js] and [npm].

## Running Locally

Before we can run the application, we'll need to install dependencies:

```sh
npm install
```

Run the application in development mode with

```sh
npm start
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/__origami/service/build/v3](http://localhost:8080/__origami/service/build/v3)


## Configuration

We configure Origami Build Service using environment variables. In local development environment configuration is not needed, unless you need to change `PORT` or `NODE_ENV` default variables. In production, these are set through Doppler project that will sync variables to Heroku as well.

### Required everywhere

* `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
* `PORT`: The port to run the application on.

### Required in Heroku

* `CHANGE_API_KEY`: The change-log API key to use when creating and closing change-logs.
* `ORIGAMI_GITHUB_TOKEN`: A GitHub token with permission to read the private `o-fonts-assets` repository.
* `REGION`: The region the application is running in. One of `QA`, `EU`, or `US`
* `RELEASE_ENV`: The Salesforce environment to include in change-logs. One of `Test` or `Production`
* `SENTRY_DSN`: The Sentry URL to send error information to
* `ARCHIVE_BUCKET_NAME`: The AWS S3 bucket to use to retrieve archived responses. One of `origami-build-service-archive-prod` (default) or `origami-build-service-archive-test`.
### Optional

* `NPM_REGISTRY_URL`: The npm Registry url to use when installing npm dependencies. Defaults to `https://registry.npmjs.org`.

## Testing

The tests are split into unit tests, integration tests, and an old suite of tests that we're migrating. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
make test-integration  # run the integration tests
```

You can run the unit tests with coverage reporting.

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CI][ci]. `make test` and `make verify` must pass before we merge a pull request.

You can run the integration tests against a URL by setting a `HOST` environment variable to the URL you want to test. This is useful for testing a Heroku application after it is deployed, which we do on CI.

```sh
HOST="https://www.example.com" make test-integration
```

## Deployment

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You can promote either through the Heroku interface, or by running the following command locally:

```sh
make promote
```

You may need to [clear cdn cache](#cache-purge) for the release to take immediate effect. For example when updating documentation.

## Cache Purge

First, change the hostname in your request to `origami-build-service-eu.herokuapp.com`. If your update does not appear, an old version is cached on the file system. Clear this by restarting the Heroku dynos:

```sh
heroku restart --app origami-build-service-eu
```

If your change does appear then the old result may be cached by our CDN. You'll need to wait for a while, or clear the CDN cache. To clear CDN cache login to Fastly and find the [www.ft.com Fastly service](https://manage.fastly.com/configure/services/133g5BGAc00Hv4v8t0dMry). Clear a specific URL (e.g. for a documentation update) or one or more of the following [surrogate keys](https://docs.fastly.com/en/guides/getting-started-with-surrogate-keys):

### Documentation Cache Purge

All documentation pages e.g. `/v2`, `/v2/api`, `/v2/migration`, `/v3/`, `/v3/api`:
- origami-build-service-website

### V3 API Cache Purge

All bundle pages e.g. `/v3/bundles/css`:
- origami-build-service-v3-js
- origami-build-service-v3-css

All fonts i.e. `/v3/font`:
- origami-build-service-v3-font

All demo pages e.g. `/v3/demo`:
- origami-build-service-v3-demo

### V2 API Cache Purge

All bundle pages e.g. `/v2/bundles/css`:
- origami-build-service-v2-js
- origami-build-service-v2-css

All file pages i.e. `/v2/files`:
- origami-build-service-v2-files

All demo pages e.g. `/v2/demos`:
- origami-build-service-v2-demos

## Monitoring

* [Grafana dashboard][grafana]: graph memory, load, and number of requests
* [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
* [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
* [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
* [Splunk (Production)][splunk]: query application logs (see below)


## Logging

We use [Splunk] to store and query our application and CDN log files. Using Splunk we can answer many questions, such as: which product is using our services the most; which components are not being requested (good candidates to deprecate).

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20%22host%3Dorigami-build.ft.com%22%20path%3D%22*o-big-number*%22%20path!%3D%22*demos*%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-90d%40d&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358263.37098) which was used to find out if our `o-big-number` component was being requested.

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20sourcetype%3D%22fastly%22%20%20serviceid%3D4kUyjWYbCqkUHQZ7mBwMzl&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-1h&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358197.36513) which shows the last hour of logs from our CDN.


## Trouble-Shooting

We've outlined some common issues that can occur when running the Build Service:

### What do I do if memory usage is high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-build-service-eu
```

If this doesn't help, then a temporary measure could be to add more dynos to the production applications, or switch the existing ones to higher performance dynos.

### What if I need to deploy manually?

If you _really_ need to deploy manually, you should only do so to QA. Production deploys should always be a promotion from QA.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy to QA using the following:

```sh
CR_API_KEY=<API-KEY> make deploy
```

### What do I do if my updated component is not appearing in bundles?

This is most likely due to the heavy caching we use. See [Cache Purge](#cache-purge).

## License

The Financial Times has published this software under the [MIT license][license].


[grafana]: http://grafana.ft.com/dashboard/db/origami-build-service
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production-eu]: https://dashboard.heroku.com/apps/origami-build-service-eu
[heroku-production-us]: https://dashboard.heroku.com/apps/origami-build-service-us
[heroku-qa]: https://dashboard.heroku.com/apps/origami-build-service-qa
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=1791038
[production-url]: https://www.ft.com/__origami/service/build/
[promises]: http://www.html5rocks.com/en/tutorials/es6/promises/
[q]: https://github.com/kriskowal/q
[semver]: http://semver.org/
[sentry-production]: https://sentry.io/nextftcom/build-service-prod/
[sentry-qa]: https://sentry.io/nextftcom/build-service-dev/
[splunk]: https://financialtimes.splunkcloud.com/
[tutorial]: https://origami.ft.com/documentation/tutorials/build-service/
