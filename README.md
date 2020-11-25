
Origami Build Service [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]
=====================

  * Creates bundles of JavaScript and CSS from Origami (and Origami-compatible modules)
  * Provides a proxy for static file serving from Origami repos
  * Compiles Origami component demos

See [the production service][production-url] for API information.

Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Running Locally](#running-locally)
  * [Configuration](#configuration)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [Monitoring](#monitoring)
  * [Trouble-Shooting](#trouble-shooting)
  * [Project Structure](#project-structure)
    * [ES6/Promises patterns](#es6promises-patterns)
  * [License](#license)


Requirements
------------

Running Origami Build Service requires [Node.js] 12.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
npm install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure Origami Build Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config. Further documentation on the available options can be found in the [Origami Service documentation][service-options].

### Required everywhere

  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `PORT`: The port to run the application on.

### Required in Heroku

  * `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`.
  * `GITHUB_USERNAME`: A GitHub username with permission to view required private repositories.
  * `GRAPHITE_API_KEY`: The FT's internal Graphite API key
  * `GRAPHITE_HOST`: The hostname of a Graphite server to gather metrics with.
  * `PREFERRED_HOSTNAME`: The hostname to use in documentation and as a base URL in bundle requests. This defaults to `www.ft.com/__origami/service/build`.
  * `REGION`: The region the application is running in. One of `QA`, `EU`, or `US`
  * `CHANGE_API_KEY`: The change-log API key to use when creating and closing change-logs.
  * `RELEASE_ENV`: The Salesforce environment to include in change-logs. One of `Test` or `Production`
  * `SENTRY_DSN`: The Sentry URL to send error information to

### Optional

  * `NPM_REGISTRY_URL`: The npm Registry url to use when installing npm dependencies
  * `BOWER_REGISTRY_URL`: The Bower Registry url to use when installing Bower dependencies

### Headers

The service can also be configured by sending HTTP headers, these would normally be set in your CDN config:

  * `FT-Origami-Service-Base-Path`: The base path for the service, this gets prepended to all paths in the HTML and ensures that redirects work when the CDN rewrites URLs.


Testing
-------

The tests are split into unit tests, integration tests, and an old suite of tests that we're migrating. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
make test-integration  # run the integration tests
make test-old          # run the old suite of tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CI][ci]. `make test` and `make verify` must pass before we merge a pull request.


Deployment
----------

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You can promote either through the Heroku interface, or by running the following command locally:

```sh
make promote
```

You may need to [clear cdn cache](#cache-purge) for the release to take immediate effect. For example when updating documentation.

Cache Purge
----------

First, change the hostname in your request to `origami-build-service-eu.herokuapp.com`. If your update does not appear, an old version is cached on the file system. Clear this by restarting the Heroku dynos:

```sh
heroku restart --app origami-build-service-eu
```

If your change does appear then the old result may be cached by our CDN. You'll need to wait for a while, or clear the CDN cache. To clear CDN cache login to Fastly and find the `Origami Build Service` Fastly service. Clear a specific URL (e.g. for a documentation update) or one or more of the following [surrogate keys](https://docs.fastly.com/en/guides/getting-started-with-surrogate-keys):

By origin:
- eu
- us

All bundle pages e.g. `/v2/bundles/css`:
- js
- css

All file pages i.e. `/v2/files`:
- files

All module pages i.e. `/v2/modules`:
- modules

All demo pages i.e. `/v2/demos`:
- demos

By vary headers:
- vary-accept-encoding
- vary-origin
- vary-access-control-request-headers

Monitoring
----------

  * [Grafana dashboard][grafana]: graph memory, load, and number of requests
  * [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
  * [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
  * [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
  * [Splunk (Production)][splunk]: query application logs (see below)


Logging
-------

We use [Splunk] to store and query our application and CDN log files. Using Splunk we can answer many questions, such as: which product is using our services the most; which components are not being requested (good candidates to deprecate).

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20%22host%3Dorigami-build.ft.com%22%20path%3D%22*o-big-number*%22%20path!%3D%22*demos*%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-90d%40d&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358263.37098) which was used to find out if our `o-big-number` component was being requested.

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20sourcetype%3D%22fastly%22%20%20serviceid%3D4kUyjWYbCqkUHQZ7mBwMzl&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-1h&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358197.36513) which shows the last hour of logs from our CDN.


Trouble-Shooting
----------------

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

Project Structure
-----------------

### ES6/Promises patterns

You'll need to understand [promises] ([Q implementation][q]) and how they use the `yield` operator.

  * Asynchronous programming changes `use(func(arg))` into `func(arg, use)`.
  * Promises change `func(arg, use)` into `func(arg).then(use)`.
  * ES6 enables turning `func(arg).then(use)` into  `use(yield func(arg))`.

The code uses promises and promise-wrapped versions of node functions. `Q.denodeify(func)` converts callback-based function into promise-returning function.

If you do `doPromise = Q.denodeify(doAsync)` then this code:

```js
doAsync1(arg1, function(err, result1){
    if (err) throw err;
    doAsync2(arg2, function(err, result2) {
        if (err) throw err;
    });
});
```

is roughly equal to:

```js
doPromise1(arg1)
.then(function(result1){
    return doPromise2(arg2);
})
.then(function(result2){
})
.done();
```

Instead of nesting callbacks, you chain `.then()` calls. Callbacks in `then` may return (a promise of) the result for the next `then` callback.

You can simplify further with `Q.async()`. This enables waiting for promises with the `yield` operator:

```js
Q.async(function*(){
    var result1 = yield doPromise1(arg1);
    var result2 = yield doPromise2(arg2);
});
```

`Q.async` returns a promise as well, so we can chain it with other promises.


License
-------

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
