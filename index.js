#!/usr/bin/env node
'use strict';

require('dotenv').load({
	silent: true
});

const createApp = require('./lib/index');
const log = require('./lib/utils/log');
const BuildSystem = require('./lib/buildsystem');
const HealthMonitor = require('./lib/monitoring/healthmonitor');
const Registry = require('./lib/registry');
const os = require('os');
const URL = require('url');
const fs = require('fs');
const path = require('path');
const denodeify = require('denodeify');
const mkdirp = denodeify(require('mkdirp'));
const tempdir = '/tmp/buildservice-' + process.pid + '/';
const writeFile = denodeify(fs.writeFile);
process.env.HOME = tempdir; // Workaround: Bower ends up using $HOME/.local/share/bower/empty despite config overriding this

const dirInitialised = mkdirp(tempdir).then(function() {

	const filePath = path.join(tempdir, '/.netrc');
	const netrc = 'machine github.com\nlogin ' + process.env.GITHUB_USERNAME + '\npassword ' + process.env.GITHUB_PASSWORD;

	return writeFile(filePath, netrc);
});

const registry = new Registry();
const healthMonitor = new HealthMonitor({log:log});
const buildSystem = new BuildSystem({
	log: log,
	port: process.env.PORT || 9000,
	export: process.env.export || 'Origami',
	tempdir: tempdir,
	registry: registry,

	installationTtl: 24*3600*1000,
	installationTtlExact: 3*24*3600*1000,
	httpProxyTtl: 12*3600*1000,
});


(function() {
	const hostname = os.hostname();

	function tcpCheckInstruction(to, port) {
		return 'Check TCP connectivity between `' + hostname +
			'` and `github.com:80`. Try: `ssh ' + hostname +
			' nc -w 5 -z ' + to + ' ' + port +
			'`.  If successful, the output of the command should include something similar to: `Connection to ' + to + ' port ' + port + ' [tcp/*] succeeded!`.';
	}

	const businessImpact = 'As problem persists, more and more Origami components in use on live sites may appear broken, unstyled or absent. This may not start to happen for several hours because the service retains saved copies of existing files for some time.';

	healthMonitor.addSystemLoadCheck({
		name: 'System load',
		checkPeriod: 10, // five minutes
		severity: 1,
		businessImpact: 'As more requests are serviced by this node, responses will become slower until they time out, styles and functionality on dependent sites may be affected.  Expect end user reports from critical sites if left unfixed.',
		panicGuide: 'If access to the virtual machine is possible, immediately attempt to restart the service using: `sudo service buildservice restart`, if access is not possible, via the InfraProd AWS Console, reboot `' + hostname + '`. Finally ensure other healthchecks are ok as failing conditions may cause load averages to increase.'
	});

	healthMonitor.addTcpIpCheck({
		name: 'Availability of Github (TCP/IP connectivity to github.com on port 80)',
		severity: 2,
		technicalSummary: 'This will prevent new modules from installing and being built where the module is stored on github.com.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
		businessImpact: businessImpact,
		panicGuide: tcpCheckInstruction('github.com', 80) + ' If this fails, check whether `github.com` loads in a web browser and `https://status.github.com/` for reported downtime, if either of these steps are successful, however the check using `ssh` and `nc` above fails, escalate to the networks team.',
		checkPeriod: 30
	}, 'github.com', 80);

	healthMonitor.addTcpIpCheck({
		name: 'Availability of Github (TCP/IP connectivity to github.com on port 443)',
		severity: 2,
		technicalSummary: 'This will prevent new modules from installing and being built where the module is stored on github.com.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
		businessImpact: businessImpact,
		panicGuide: tcpCheckInstruction('github.com', 443) + ' If this fails, check whether `github.com` loads in a web browser and `https://status.github.com/` for reported downtime, if either of these steps are successful, however the check using `ssh` and `nc` above fails, escalate to the networks team.',
		checkPeriod: 30
	}, 'github.com', 443);


	healthMonitor.addTcpIpCheck({
		name: 'Availability of registry.origami.ft.com (TCP/IP connectivity to registry.origami.ft.com on port 80)',
		severity: 2,
		technicalSummary: 'This will prevent any new modules from installing and being built.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
		panicGuide: tcpCheckInstruction('registry.origami.ft.com', 80) + ' If this fails, check whether `registry.origami.ft.com` loads in a web browser, if this is unsuccessful refer to registry.origami.ft.com/__health.',
		businessImpact: businessImpact,
		checkPeriod: 30
	}, 'registry.origami.ft.com', 80);

	healthMonitor.addMemoryChecks({
		severity: 1,
		checkPeriod: 120,
		technicalSummary: 'Process has run out of available memory',
		businessImpact: 'Application will not be able to serve styles and interaction functionality to critical sites. Expect end users reports.',
		panicGuide: 'Restart the service using the `heroku` command line tool: `heroku restart --app origami-build-service-eu`.'
	});

	dirInitialised.then(function() {
		healthMonitor.addDiskChecks({
			severity: 1,
			checkPeriod: 120,
			technicalSummary: '/tmp directory is full, new modules will not be installable.',
			panicGuide: 'Restart the service using the `heroku` command line tool: `heroku restart --app origami-build-service-eu`.',
			businessImpact: 'New modules will not be able to install and existing modules will not refresh. As problem persists expect end user reports from critical sites regarding styling and broken functionality.'
		}, tempdir);
	});

	const seenPackageHosts = {};
	healthMonitor.addCheck({
		name: 'Listing all packages at registry.origami.ft.com',
		severity: 2,
		businessImpact: 'Static files won\'t be served. Healthcheck may be incomplete',
		panicGuide: 'Ensure registry.origami.ft.com/packages returns 200 and is valid JSON.',
		checkPeriod: 60,
	}, function(){
		return registry.refreshPackageList().then(function(packageList){
			const checksToAdd = [];
			for(let i=0; i < packageList.length; i++) {
				const p = packageList[i];
				const url = URL.parse(p.url, false, true);

				if (!url.host) continue;

				if (!seenPackageHosts[url.host]) {  // url.host contains the port as well
					seenPackageHosts[url.host] = {url:url, packageNames:[]};
					checksToAdd.push(seenPackageHosts[url.host]);
				}
				if (seenPackageHosts[url.host].packageNames.length < 25) {
					seenPackageHosts[url.host].packageNames.push(p.name);
				}
				else if (seenPackageHosts[url.host].packageNames.length === 25) {
					seenPackageHosts[url.host].packageNames.push('and more…');
				}
			}

			for(let i=0; i < checksToAdd.length; i++) {
				const host = checksToAdd[i];

				let hostName = host.url.host;
				let port = 80;
				if (host.url.host.includes(':')) {
					const splitUrl = host.url.host.split(':');
					hostName = splitUrl[0];
					port = splitUrl[1];
				}

				healthMonitor.addTcpIpCheck({
					name: 'Availability of package server ' + host.url.host + ' (TCP/IP)',
					severity: 2,
					businessImpact: 'It won\'t be possible to install or refresh these packages: ' + host.packageNames.join(', '),
					panicGuide: 'Ensure TCP/IP connections to ' + host.url.host + ' work from ' + os.hostname() + '.  Try commands: `ssh ' + os.hostname() + '`, then `nc -w 5 -z ' + hostName + ' ' + port + '`.  If the output of the `nc` command is successful it will output something like: `Connection to ' + host.url.host + ' port ' + port + ' [tcp/*] succeeded!`, if this is unsuccessful the output will be blank after approximately 5 seconds. Escalate to the Networks team.',
					checkPeriod: 60,
				}, host.url.hostname, host.url.port || 80);
			}
		});
	});
}());

const app = createApp({
	buildSystem: buildSystem,
	healthMonitor: healthMonitor,
	writeAccessLog: true
});

app.listen(process.env.PORT || 9000, function() {
	log.info({port: process.env.PORT || 9000, env:process.env.NODE_ENV}, 'Started server');
});
