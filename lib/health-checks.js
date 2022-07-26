'use strict';

const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Create and return the health check
	return new HealthCheck({
		checks: [

			// This check ensures that GitHub is available
			// on port 80. It will fail on a bad response
			// or socket timeout
			{
				type: 'tcp-ip',
				host: 'github.com',
				port: 80,
				interval: 10 * 60 * 1000, // 10 minutes
				id: 'github-tcp-port-80',
				name: 'Availability of Github (TCP/IP connectivity to github.com on port 80)',
				severity: 2,
				technicalSummary: 'This will prevent new components from installing and being built where the component is stored on github.com.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
				businessImpact: 'As problem persists, more and more Origami components in use on live sites may appear broken, unstyled or absent. This may not start to happen for several hours because the service retains saved copies of existing files for some time.',
				panicGuide: 'Check whether `github.com` loads in a web browser and https://status.github.com/ for reported downtime.'
			},

			// This check ensures that GitHub is available
			// on port 443. It will fail on a bad response
			// or socket timeout
			{
				type: 'tcp-ip',
				host: 'github.com',
				port: 443,
				interval: 10 * 60 * 1000, // 10 minutes
				id: 'github-tcp-port-443',
				name: 'Availability of Github (TCP/IP connectivity to github.com on port 443)',
				severity: 2,
				technicalSummary: 'This will prevent new components from installing and being built where the component is stored on github.com.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
				businessImpact: 'As problem persists, more and more Origami components in use on live sites may appear broken, unstyled or absent. This may not start to happen for several hours because the service retains saved copies of existing files for some time.',
				panicGuide: 'Check whether `github.com` loads in a web browser and https://status.github.com/ for reported downtime.'
			},

			// This check ensures that The Origami Registry
			// is available on port 80. It will fail on a
			// bad response or socket timeout
			{
				type: 'tcp-ip',
				host: 'registry.npmjs.org',
				port: 80,
				interval: 10 * 60 * 1000, // 10 minutes
				id: 'registry-npm-tcp-port-80',
				name: 'Availability of npm registry (TCP/IP connectivity to registry.npmjs.org on port 80)',
				severity: 2,
				technicalSummary: 'This will prevent any new components from installing and being built.  If this continues to fail for large periods of time, expect end user reports from critical sites if left unfixed.',
				businessImpact: 'As problem persists, more and more Origami components in use on live sites may appear broken, unstyled or absent. This may not start to happen for several hours because the service retains saved copies of existing files for some time.',
				panicGuide: 'Check the status of npm https://status.npmjs.org/ for more information.'
			},

			// This check monitors the process memory usage
			// It will fail if usage is above the threshold
			{
				type: 'memory',
				threshold: 75,
				interval: 15000,
				id: 'system-memory',
				name: 'System memory usage is below 75%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all requests',
				technicalSummary: 'Process has run out of available memory',
				panicGuide: 'Restart the service dynos on Heroku'
			},

			// This check monitors the system CPU usage
			// It will fail if usage is above the threshold
			{
				type: 'cpu',
				threshold: 125,
				interval: 15000,
				id: 'system-load',
				name: 'System CPU usage is below 125%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all requests',
				technicalSummary: 'Process is hitting the CPU harder than expected',
				panicGuide: 'Restart the service dynos on Heroku'
			},

			// This check monitors the system disk space
			// It will fail if usage is above the threshold
			{
				type: 'disk-space',
				threshold: 90,
				interval: 60000,
				id: 'disk-space',
				name: 'System disk-space usage is below 90%',
				severity: 1,
				businessImpact: 'New components will not be able to install and existing components will not refresh. As problem persists expect end user reports from critical sites regarding styling and broken functionality.',
				technicalSummary: '/tmp directory is full, new components will not be installable.',
				panicGuide: 'Restart the service dynos on Heroku'
			}

		],
		log: options.log
	});
}
