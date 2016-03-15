# Origami Build service [![Circle CI](https://circleci.com/gh/Financial-Times/origami-build-service.svg?style=svg)](https://circleci.com/gh/Financial-Times/origami-build-service)

Creates bundles of JavaScript and CSS from building Origami and Origami-compatible modules, and provides a proxy for static file serving from Origami repos.

See [the production service](https://build.origami.ft.com/) for API information


## Development set up

To set up a development environment, you'll need `docker-compose` and `docker` as well as virtualisation software, such as [VirtualBox](https://www.virtualbox.org/), if you're on a Mac. You can either use the [Docker Mac set up guide](http://docs.docker.com/mac/step_one/), or use [homebrew](http://brew.sh/):

```sh
brew tap caskroom/homebrew-cask
brew install brew-cask
brew cask install dockertoolbox docker-compose
```

Create a virtual machine to run the application's containers, and put that machine's config into your environment. The default size didn't appear to be large enough so this will create one with an increased disk size:

```sh
# Create a Docker machine
docker-machine create --driver virtualbox --virtualbox-disk-size "50000"

# Output the Docker machine environment config
docker-machine env

# Add the machine's config to your current environment
eval $(docker-machine env)
```

Find out the IP address of the machine:

```sh
docker-machine ip
```

In the build service's working directory, use `docker-compose` to build and start a container:

```sh
docker-compose build
docker-compose up
```

Now you can access the app at the IP address discovered earlier, over HTTP on port 8080:

```sh
open "http://$(docker-machine ip):8080/"
```

To SSH into the web container run:

```sh
docker-compose run web sh
```


## Deployment

You need to be authenticated with [Heroku](https://heroku.com) (this app is `origami-buildservice-eu` and `origami-buildservice-qa`). We deploy continuously to QA via [CircleCI](https://circleci.com/gh/Financial-Times/origami-build-service), ~~and use a [Heroku pipeline](https://dashboard.heroku.com/pipelines/5d8d698d-1940-48bb-8967-e07b9e7d1272) to promote QA deployments to production~~.

:warning: Currently we're having to manually deploy to production while we wait for Heroku Docker/pipeline support. Deploy the last QA image by running the following, avoiding having to build locally:

```sh
docker pull registry.heroku.com/origami-buildservice-qa/web
docker tag registry.heroku.com/origami-buildservice-qa/web registry.heroku.com/origami-buildservice-eu/web
docker push registry.heroku.com/origami-buildservice-eu/web
```


## Orchestration files

The following files are used in build, test and deploy automation:

* `.dockerignore`: used to ignore things when adding files to the Docker image. Generally this will be the same as the `.gitignore` file as the build happens at the container creation time.
* `Dockerfile`: Builds the web container. For local development, this is run as-is by docker-compose. For deployment, this container is pushed to Heroku's docker registry.
* `docker-compose.yml`: Creates the environment for local development by specifying how the web container should be run on the local docker-machine VM.


## Configuration

In dev, this is configured in `docker-compose.yml`. In production, it's `heroku config`.

* `PORT`: The port to run the application on. This is set by docker-compose locally, and Heroku in production.
* `NODE_ENV`: Standard Node convention for specifying which type of environment we're in, 'development' or 'production'.
* `SENTRY_DSN`: URL of the Sentry project to use to collect runtime errors, exceptions and log messages.
* `GRAPHITE_HOST`: The host of the Graphite server used to gather metrics.
* `LOG_LEVEL`: Syslog-compatible level at which to emit log events to stdout ('trace', 'debug', 'info', 'warn', 'error', or 'crit').
* `GITHUB_USERNAME`: A GitHub username which has access to any private repositories that bower needs to see.
* `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`.


## Testing

The tests are split into unit tests, integration tests, and an older suite of tests that we're in the process of migrating. To run tests on your machine you'll need to install [Node.js](https://nodejs.org/) and run `npm install`. Then you can run the following commands:

```sh
npm test                  # run all of the tests
npm run test-unit         # run the unit tests
npm run test-integration  # run the integration tests
npm run test-old          # run the old suite of tests
```

You can run the _unit_ tests with coverage reporting, which we've configured to expect >= 90% coverage:

```sh
npm run test-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
npm run lint
```

We run the tests and linter on CI, you can view [results on CircleCI](https://circleci.com/gh/Financial-Times/origami-build-service). Tests and linting must pass before a pull request will be merged.


## Monitoring

### Pingdom Checks

We use [Pingdom](https://my.pingdom.com/reports/uptime#check=1299983) to monitor uptime:

- `Origami Build Service EU Origin (HTTPS)` checks that the Heroku App is responding to HTTPS requests.
- `Origami Build Service EU Origin (HTTP)` checks that the Heroku App is responding to HTTP requests.

There are various checks for the edge endpoint too.


## Maintenance

### Disk space

Temp files are stored in `/tmp/buildservice-$PID`. If you run low on disk
space you may need to restart Dynos.

## Memory Usage

Restart the service when memory usage becomes too high. (Restart dynos).


## ES6/Promises patterns

To understand the code you must understand [promises](http://www.html5rocks.com/en/tutorials/es6/promises/) (the [Q promise](https://github.com/kriskowal/q) implementation) and their use of the `yield` operator.

* Asynchronous programming changes `use(func(arg))` into `func(arg, use)`.
* Promises change `func(arg, use)` into `func(arg).then(use)`.
* ES6 enables turning `func(arg).then(use)` into  `use(yield func(arg))`.

The code uses promises and promise-wrapped versions of node functions. `Q.denodeify(func)` converts callback-based function into promise-returning function.

If you do `doPromise = Q.denodeify(doAsync)` then this code:

    doAsync1(arg1, function(err, result1){
        if (err) throw err;
        doAsync2(arg2, function(err, result2) {
            if (err) throw err;
        });
    });

is roughly equivalent to:

    doPromise1(arg1)
    .then(function(result1){
        return doPromise2(arg2);
    })
    .then(function(result2){
    })
    .done();

Instead of nesting callbacks you chain `.then()` calls. Callback in `then` may return (promise of) result for the next `then` callback.

This is further simplified with `Q.async()` which enables waiting for promises with the `yield` operator:

    Q.async(function*(){
        var result1 = yield doPromise1(arg1);
        var result2 = yield doPromise2(arg2);
    });

`Q.async` returns a promise as well, so it can be chained with other promises.


## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
