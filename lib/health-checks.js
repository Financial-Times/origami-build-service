'use strict';

const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Create and return the health check
	return new HealthCheck({
		checks: [

			// @todo add v2 archive health check
			// @todo add v3 bundle / font file check – npm access? github access?
			
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
				businessImpact: 'New modules will not be able to install and existing modules will not refresh. As problem persists expect end user reports from critical sites regarding styling and broken functionality.',
				technicalSummary: '/tmp directory is full, new modules will not be installable.',
				panicGuide: 'Restart the service dynos on Heroku'
			}

		],
		log: options.log
	});
}
