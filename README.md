
Origami Build Service
=====================

  * Creates bundles of JavaScript and CSS from Origami (and Origami-compatible modules)
  * Provides a proxy for static file serving from Origami repos
  * Compiles Origami component demos

See [the production service][build-service] for API information.

[![Build status](https://img.shields.io/circleci/project/Financial-Times/origami-build-service.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]


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
    * [Orchestration Files](#orchestration-files)
    * [ES6/Promises patterns](#es6promises-patterns)
  * [License](#license)


Requirements
------------

Running Origami Build Service requires [Node.js] 4.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
make install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `9000`: [http://localhost:9000/](http://localhost:9000/)


Configuration
-------------

We configure Origami Build Service using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `LOG_LEVEL`: A Syslog-compatible level at which to emit log events to stdout. One of `trace`, `debug`, `info`, `warn`, `error`, or `crit`.
  * `SENTRY_DSN`: The URL of a [Sentry] project to collect exception information with.
  * `GRAPHITE_HOST`: The hostname of a Graphite server to gather metrics with.
  * `GITHUB_USERNAME`: A GitHub username with permission to view required private repositories.
  * `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`.
  * `METRICS_ENV`: The environment to store metrics under. This defaults to `NODE_ENV`, which allows us to measure QA/production metrics separately.
  * `PREFERRED_HOSTNAME`: The hostname to use in documentation and as a base URL in bundle requests. This defaults to `origami-build.ft.com`.


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

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

The [production][heroku-production] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production, this can be done with:

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy the last QA image by running the following:

```sh
CR_API_KEY=<API-KEY> make promote
```

We use [Semantic Versioning][semver] to tag releases. Only tagged releases should hit production, this ensures that the `__about` endpoint is informative. To tag a new release, use one of the following (this is the only time we allow a commit directly to `master`):

```sh
npm version major
npm version minor
npm version patch
```

Now you can push to GitHub (`git push && git push --tags`) which will trigger a QA deployment. Once QA has deployed with the newly tagged version, you can promote it to production.

To promote to production you will need to create a file in the root of this project named `.env` and fill it with a few environment variables, the contents of this file is stored in the [Origami LastPass][lastpass] under the name `[dev] Origami build service`. You'll need to also provide your GitHub username for change request logging, ensure you've been [added to this spreadsheet][developer-spreadsheet].

To promote the last QA image into production, running the following:

```sh
GITHUB_USERNAME=yourgithubusername make promote
```

Monitoring
----------

We use Graphite and [Grafana] to keep track of application metrics. You can view requests, bundle build duration, cache hit ratios, and memory usage. It's important after a deploy to make sure you haven't unexpectedly had an impact on these.

We also use [Pingdom] to track uptime. You should get notifications if you're a member of the Origami team. The Pingdom checks are:

  * `Origami Build Service EU Origin (HTTPS)`: checks that the application is responding on HTTPS.
  * `Origami Build Service EU Origin (HTTP)`: checks that the application is responding on HTTP.

Logging
----------

We use [Splunk] to store and query our application and CDN log files. Using Splunk we can answer many questions, such as: which product is using our services the most; which components are not being requested (good candidates to deprecate).

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20%22host%3Dorigami-build.ft.com%22%20path%3D%22*o-big-number*%22%20path!%3D%22*demos*%22&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-90d%40d&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358263.37098) which was used to find out if our `o-big-number` component was being requested.

[Here is an example query](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20sourcetype%3D%22fastly%22%20%20serviceid%3D4kUyjWYbCqkUHQZ7mBwMzl&display.page.search.mode=fast&dispatch.sample_ratio=1&earliest=-1h&latest=now&display.page.search.tab=events&display.general.type=events&sid=1476358197.36513) which shows the last hour of logs from our CDN.

Trouble-Shooting
----------------

We've outlined some common issues that can occur when running the Build Service:

### What do I do if memory usage is high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-buildservice-eu
```

You can use [Node Inspector][node-inspector] to debug local memory issues if you think there's a genuine problem. We're working on building this into the development process. For now, [speak to Rowan Manning][email-rowan] if you want info on how to set up Node Inspector.

### What do I do if my updated component is not appearing in bundles?

This is most likely due to the heavy caching we use.

First, change the hostname in your request to `origami-buildservice-eu.herokuapp.com`. If your update appears now, then Akamai had cached the bundle. You'll need to wait for a while, or clear the Akamai cache for your URL.

If your component still doesn't appear, then we've cached an older version on the file system. You can clear this by restarting the Heroku dynos:

```sh
heroku restart --app origami-buildservice-eu
```

### What if I need to deploy manually?

If you _really_ need to deploy manually, you should only do so to QA. Production deploys should always be a promotion from QA.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy to QA using the following:

```sh
CR_API_KEY=<API-KEY> make deploy
```


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



[build-service]: https://origami-build.ft.com/
[ci]: https://circleci.com/gh/Financial-Times/origami-build-service
[email-rowan]: mailto:rowan.manning@ft.com
[grafana]: http://grafana.ft.com/dashboard/db/origami-build-service
[heroku-cli]: https://devcenter.heroku.com/articles/heroku-command
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production]: https://dashboard.heroku.com/apps/origami-buildservice-eu
[heroku-qa]: https://dashboard.heroku.com/apps/origami-buildservice-qa
[heroku]: https://heroku.com/
[lastpass]: https://lastpass.com
[license]: http://opensource.org/licenses/MIT
[node-inspector]: https://github.com/node-inspector/node-inspector
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom]: https://my.pingdom.com/reports/uptime#check=1299983
[promises]: http://www.html5rocks.com/en/tutorials/es6/promises/
[q]: https://github.com/kriskowal/q
[semver]: http://semver.org/
[sentry]: https://getsentry.com/
[splunk]: https://financialtimes.splunkcloud.com/
