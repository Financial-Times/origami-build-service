
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

The following command creates a virtual machine in which to run the application's containers. The default size didn't appear to be large enough so this will create one with an increased disk size:

```sh
docker-machine create --driver virtualbox --virtualbox-disk-size "50000" default
```

Add the machine's config to your current environment by running the following:

```sh
eval $(docker-machine env default)
```

In future Terminal sessions, you'll need to run the following in order to start the docker machine:

```sh
docker-machine start default
```

You'll also need to add the machine's config to your environment again using the `eval` command outlined above. Alternatively, you can add this command to your `.bash_profile` file to automatically do this.


Running Locally
---------------

Before we can run the application, we'll need to create a `.env` file. You can copy the sample file, and consult the documentation for [available options](#configuration):

```sh
cp sample.env .env
```

In the working directory, use `docker-compose` to build and start a container. We have some Make tasks which simplify this:

```sh
make build-dev run-dev
```

Now you can access the app over HTTP on port `8080`. If you're on a Mac, you'll need to use the IP of your Docker Machine:

```sh
open "http://$(docker-machine ip default):8080/"
```

To attach a bash process (for debugging, etc) to the running Docker image:

```sh
make attach-dev
```


Configuration
-------------

We configure Origami Build Service using environment variables. In development, configurations are set in `docker-compose.yml`. In production, these are set through Heroku config.

  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `SENTRY_DSN`: The URL of a [Sentry] project to collect exception information with.
  * `GRAPHITE_HOST`: The hostname of a Graphite server to gather metrics with.
  * `LOG_LEVEL`: A Syslog-compatible level at which to emit log events to stdout. One of `trace`, `debug`, `info`, `warn`, `error`, or `crit`.
  * `GITHUB_USERNAME`: A GitHub username with permission to view required private repositories.
  * `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`.
  * `METRICS_ENV`: The environment to store metrics under. This defaults to `NODE_ENV`, which allows us to measure QA/production metrics separately.


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

The [production][heroku-production] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. ~~We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production~~.

:warning: We have to deploy to production manually while we wait for Heroku Docker/pipeline support. You'll need access to the Heroku Docker private beta, and to have logged into the registry.

Run the following command exactly, don't replace the underscores in username and password:

```sh
docker login --email=_ --username=_ --password=$(heroku auth:token) registry.heroku.com
```

You'll need to provide your GitHub username for change request logging, ensure you've been [added to this spreadsheet][developer-spreadsheet]. Now deploy the last QA image by running the following, avoiding having to build locally:

```sh
GITHUB_USERNAME=yourgithubusername make promote
```

We use [Semantic Versioning][semver] to tag releases. Only tagged releases should hit production, this ensures that the `__about` endpoint is informative. To tag a new release, use one of the following (this is the only time we allow a commit directly to `master`):

```sh
npm version major
npm version minor
npm version patch
```

Now you can push to GitHub (`git push && git push --tags`) which will trigger a QA deployment. Once QA has deployed with the newly tagged version, you can promote it to production.


Monitoring
----------

We use Graphite and [Grafana] to keep track of application metrics. You can view requests, bundle build duration, cache hit ratios, and memory usage. It's important after a deploy to make sure you haven't unexpectedly had an impact on these.

We also use [Pingdom] to track uptime. You should get notifications if you're a member of the Origami team. The Pingdom checks are:

  * `Origami Build Service EU Origin (HTTPS)`: checks that the application is responding on HTTPS.
  * `Origami Build Service EU Origin (HTTP)`: checks that the application is responding on HTTP.


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


Project Structure
-----------------

### Orchestration files

We use the following files in build, test and deploy automation:

  * `.dockerignore`: Used to ignore things when adding files to the Docker image.
  * `Dockerfile`: Instructions to build the web container. CI uses this as part of deployment.
  * `docker-compose.yml`: Extra instructions required for building a development Docker container.

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
[developer-spreadsheet]: https://docs.google.com/spreadsheets/d/1mbJQYJOgXAH2KfgKUM1Vgxq8FUIrahumb39wzsgStu0/edit#gid=0
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
[sentry]: https://getsentry.com/
[virtualbox]: https://www.virtualbox.org/
