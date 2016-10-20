'use strict';

const argv = process.argv;
let environment;

if (argv.includes('--ci')) {
  environment = {
    name: 'ci',
    host: 'https://origami-build-ci.ft.com'
  };
} else if (argv.includes('--qa')) {
  environment = {
    name: 'staging',
    host: 'https://origami-build-qa.ft.com'
  };
} else if (argv.includes('--prod')) {
  environment = {
    name: 'production',
    host: 'https://origami-build.ft.com'
  };
} else {
  console.error('These tests need to run on either "--prod", "--qa" or "--ci".');
  console.error('To run the tests on qa: `mocha ./test-vcl/*.spec.js -t 30000 -s 500 --qa`');
  process.exit(1);
}

console.log(`Using ${environment.name} environment (${environment.host})`);

module.exports = Object.assign(environment, {
  home: '/v2/'
});
