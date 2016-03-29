
Origami Build Service
=====================

Creates bundles of JavaScript and CSS from building Origami and Origami-compatible modules, and provides a proxy for static file serving from Origami repos. See [the production service][build-service] for API information.

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

Running Origami Build Service requires a few tools:

  * [VirtualBox]: For running your Docker machine **(_Mac Only_)**
  * [Docker]: For building Docker images
  * [Docker Compose][docker-compose]: For building and running a development image
  * [Docker Machine][docker-machine]: For installing and running a Docker engine **(_Mac Only_)**
  * [Node.js] 4.x and [npm]: For running tests locally (we don't run them on the Docker images)

### Mac Guide

You can simplify some of the set up on a Mac by using the [Docker Mac set up guide][docker-mac] or [homebrew]:

```sh
brew tap caskroom/homebrew-cask
brew install brew-cask
brew cask install dockertoolbox docker-compose
```

Create a virtual machine to run the application's containers, and put that machine's config into your environment. The default size didn't appear to be large enough so this will create one with an increased disk size:

```sh
docker-machine create --driver virtualbox --virtualbox-disk-size "50000"
```

Add the machine's config to your current environment by running the following. You can also add this line to your `.bash_profile` so that it's present in all further environments.

```sh
eval $(docker-machine env)
```


Running Locally
---------------

In the Origami Build Service working directory, use `docker-compose` (via our Make tasks) to build and start a container:

```sh
make build-dev run-dev
```

Now you can access the app over HTTP on port `8080`. If you're on a Mac, you'll need to use the IP of your Docker Machine:

```sh
open "http://$(docker-machine ip):8080/"
```

To attach a bash process (for debugging, etc) to the running Docker image:

```sh
make attach-dev
```


Configuration
-------------

Origami Build Service is configured using environment variables. In development, configurations are set in `docker-compose.yml`. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: Which environment the application should run in, `production`, `development` (default), or `test` (for use in automated tests).
  * `SENTRY_DSN`: URL of the Sentry project to use to collect runtime errors, exceptions and log messages.
  * `GRAPHITE_HOST`: The hostname of the Graphite server used to gather metrics.
  * `LOG_LEVEL`: Syslog-compatible level at which to emit log events to stdout (`trace`, `debug`, `info`, `warn`, `error`, or `crit`).
  * `GITHUB_USERNAME`: A GitHub username which has access to any private repositories that bower needs to see.
  * `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`.
  * `METRICS_ENV`: Which environment to store metrics under. This defaults to `NODE_ENV`, which allows us to measure QA/production metrics separately.


Testing
-------

The tests are split into unit tests, integration tests, and an older suite of tests that we're in the process of migrating. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all of the tests
make test-unit         # run the unit tests
make test-integration  # run the integration tests
make test-old          # run the old suite of tests
```

You can run the unit tests with coverage reporting, which we've configured to expect `>= 90%` coverage:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before a pull request will be merged.


Deployment
----------

The [production][heroku-production] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], You should never really deploy to QA manually. ~~We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production~~.

:warning: Currently we're having to manually deploy to production while we wait for Heroku Docker/pipeline support. Deploy the last QA image by running the following, avoiding having to build locally:

```sh
make promote
```

We use [Semantic Versioning][semver] to tag releases. Only tagged releases should make it to production, so that the `__about` endpoint is informative. To tag a new release, use one of the following (this is the only time we allow a commit directly to `master`):

```sh
npm version major
npm version minor
npm version patch
```

Now you can push to GitHub (`git push && git push --tags`) which will trigger a QA deployment. Once QA has been deployed to with the newly tagged version, you can promote it to production.


Monitoring
----------

We use Graphite and [Grafana] to keep track of application metrics. You can view requests, bundle build duration, cache hit ratios, and memory usage. It's important after a deploy to make sure you haven't unexpectedly had an impact on these.

We also use [Pingdom] to monitor uptime. You should get notifications if you're a member of the Origami team. The Pingdom checks are:

  * `Origami Build Service EU Origin (HTTPS)` checks that the Heroku App is responding to HTTPS requests.
  * `Origami Build Service EU Origin (HTTP)` checks that the Heroku App is responding to HTTP requests.


Trouble-Shooting
----------------

We've tried to outline some common issues that can occur in the running of the build service, as well as possible solutions:

### What do I do if memory usage is really high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-buildservice-eu
```

You can use [Node Inspector][node-inspector] to debug memory issues locally if you think there's a genuine problem. We're working on building this into the development process, but for now [speak to Rowan Manning][email-rowan] if you want info on how to set up Node Inspector.

### What do I do if my updated component is not appearing in bundles?

This is most likely due to the heavy caching we employ.

First, change the hostname in your request to `origami-buildservice-eu.herokuapp.com`. If your updated component appears now, then the reason it wasn't appearing before is because Akamai has cached the bundle. You'll need to wait for a while, or clear the Akamai cache for your URL.

If your component still doesn't appear, it means that an older version has been cached on the local file system in Heroku. You can clear this by restarting the Heroku dynos:

```sh
heroku restart --app origami-buildservice-eu
```


Project Structure
-----------------

### Orchestration files

The following files are used in build, test and deploy automation:

  * `.dockerignore`: Used to ignore things when adding files to the Docker image.
  * `Dockerfile`: Instructions to build the web container. This is used as-is by `docker-compose` locally, and on CI as part of deployment.
  * `docker-compose.yml`: Additional instructions required for building a development Docker container.

### ES6/Promises patterns

To understand the code you must understand [promises] (the [Q promise][q] implementation) and their use of the `yield` operator.

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

is roughly equivalent to:

```js
doPromise1(arg1)
.then(function(result1){
    return doPromise2(arg2);
})
.then(function(result2){
})
.done();
```

Instead of nesting callbacks you chain `.then()` calls. Callback in `then` may return (promise of) result for the next `then` callback.

This is further simplified with `Q.async()` which enables waiting for promises with the `yield` operator:

```js
Q.async(function*(){
    var result1 = yield doPromise1(arg1);
    var result2 = yield doPromise2(arg2);
});
```

`Q.async` returns a promise as well, so it can be chained with other promises.


License
-------

This software is published by the Financial Times under the [MIT license][license].



[build-service]: https://build.origami.ft.com/
[ci]: https://circleci.com/gh/Financial-Times/origami-build-service
[docker-compose]: https://docs.docker.com/compose/
[docker-mac]: http://docs.docker.com/mac/step_one/
[docker-machine]: https://docs.docker.com/machine/
[docker]: https://www.docker.com/
[email-rowan]: mailto:rowan.manning@ft.com
[grafana]: http://grafana.ft.com/dashboard/db/origami-build-service
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/9cd9033e-fa9d-42af-bfe9-b9d0aa6f4a50
[heroku-production]: https://dashboard.heroku.com/apps/origami-buildservice-eu
[heroku-qa]: https://dashboard.heroku.com/apps/origami-buildservice-qa
[heroku]: https://heroku.com/
[homebrew]: http://brew.sh/
[license]: http://opensource.org/licenses/MIT
[node-inspector]: https://github.com/node-inspector/node-inspector
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom]: https://my.pingdom.com/reports/uptime#check=1299983
[promises]: http://www.html5rocks.com/en/tutorials/es6/promises/
[q]: https://github.com/kriskowal/q
[semver]: http://semver.org/
[virtualbox]: https://www.virtualbox.org/
