# Origami Build service

Creates bundles of JavaScript and CSS from building Origami and Origami-compatible modules, and provides a proxy for static file serving from Origami repos.

See [the live service](https://build.origami.ft.com/) for API information

## Development set up

To set up a development environment, download and install the docker toolkit (http://docs.docker.com/mac/step_one/).  You'll need `docker-compose` and `docker`.  Or use homebrew:

    brew tap caskroom/homebrew-cask
    brew install brew-cask
    brew cask install docker-machine docker-compose

You may now have to change the owner of your `.docker` directory if it is owned by root:

    chown -R `whoami` ~/.docker

Create a virtual machine to run the application's containers, and put that machine's config into your environment, both right now and on next login.  The default size didn't appear to be large enough so this will create one with an increased disk size:

    docker-machine create --driver virtualbox --virtualbox-disk-size "50000" dev
    docker-machine env dev
    eval $(docker-machine env dev)
    echo "eval $(docker-machine env dev)" >> ~/.profile

Find out the IP address of the machine:

    docker-machine ip dev

In the build service's working directory, run the build and start the app:

    npm run build
    docker-compose up

Now you can access the app at the IP address discovered earlier, over HTTP on port 8080.  So eg in the browser go to http://192.168.99.102:8080/ (if that was the IP given by `docker-machine ip dev`)

To SSH into the web container, you first need to SSH into the Docker VM, and then into the container you want:

    - docker-machine ssh dev
    - docker ps
    - docker exec -i -t buildservice_web_1 bash

## Deployment

You need to be authenticated with Heroku (this app is `origami-buildservicce-eu` and `origami-buildservice-qa`) - and you need the Heroku docker plugin: `heroku plugins:install heroku-docker`.

Then, run `npm run deploy-qa` or `npm run deploy-prod`.  We use npm to wrap the Heroku docker release process so that an `appversion` file can be stamped with the current version of the app so that the `/__about` endpoint can correctly describe which version of the app has been deployed.

## Orchestration files

The following files are used in build, test and deploy automation:

* `.dockerignore`: used to ignore things when adding files to the Docker image.  Generally this will be the same as the `.gitignore` file as the build happens at the container creation time.  See the `Dockerfile` for more info.
* `app.json`: Heroku standard application metadata
* `Dockerfile`: Builds the web container. For local development, this is run as-is by docker-compose. When deployed to Heroku, only the files created inside /app will be uploaded to the Heroku environment, so things like setting environment variables needs to be done both in the standard Docker way (`ENV` commands) and also be writing profile scripts that will be run on startup in Heroku's environment.
* `docker-compose.yml`: Creates the environment for local development by specifying how the web container should be run on the local docker-machine VM.
* `Procfile`: The command to run in Heroku environments.  Essentially the Heroku equivalent of docker-compose.yml
* `netrc`: TODO

## Configuration

In dev, this is configured in docker-compose.yml.  In live, it's `heroku config`

* `PORT`: Port used by Apache to serve HTTP traffic.  Must match container's exposed ports config.  Should not be configured explicitly on Heroku
* `NODE_ENV`: Standard Node convention for specifying which type of environment we're in, 'development' or 'production'
* `SENTRY_DSN`: URL of the Sentry project to use to collect runtime errors, exceptions and log messages
* `GRAPHITE_HOST`: The host of the Graphite server used to gather metrics
* `LOG_LEVEL`: Syslog-compatible level at which to emit log events to stdout ('trace', 'debug', 'info', 'warn', 'error', or 'crit')
* `SLACK_CHANNEL`: Slack channel to post new module notifications in
* `BUILD_SERVICE_HOST`: Hostname of the build service to use for fetching module metadata
* `VIEW_CACHE_PATH`: Path on disk to use to cache view templates in Twig
* `DEBUG_KEY`: String, if set in a `Debug` HTTP header, will set dev mode to true for that request only.
* `GITHUB_USERNAME`: A GitHub username which has access to any private repositories that bower needs to see
* `GITHUB_PASSWORD`: The GitHub password corresponding to `GITHUB_USERNAME`


## Testing and monitoring

To run the tests start a container with the command `npm test` instead of the one configured in docker-compose.

### Monitoring

#### Pingdom Checks

- `Origami Build Service EU Origin (HTTPS) `

Checks that the Heroku App is responding to HTTPS requests.

- `Origami Build Service EU Origin (HTTP)`

Checks that the Heroku App is responding to HTTP requests.

There are various checks for the edge endpoint too.

### Maintenance

#### Disk space

Temp files are stored in `/tmp/buildservice-$PID`. If you run low on disk
space you may need to restart Dynos.

### Memory Usage

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


## Troubleshooting

### npm install fails with `ENOENT`

npm sometimes caches incomplete modules. Delete `~/.npm/`.

### TypeError: Arguments to path.join must be strings

That's a bug in Bower. Apply https://github.com/bower/bower/pull/1434


## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
