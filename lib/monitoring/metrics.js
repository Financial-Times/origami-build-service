'use strict';

// TODO remove this file. The use of console.log is temporary,
// because we can't use the correct Origami Service log – it's
// not a global or something that can be exported separately

const Graphite = require('graphite');
const Measured = require('measured');
const blocked = require('blocked');

const reportInterval = 5000;
const graphiteHost = process.env.GRAPHITE_HOST || null;
const graphitePort = process.env.GRAPHITE_PORT || 2003;
const envName = process.env.METRICS_ENV || process.env.NODE_ENV || 'unknown';
const processIdentifier = process.env.DYNO ? 'dyno-' + process.env.DYNO.replace('.', '') : 'pid-' + process.pid;

let timer = null;
let graphite = null;
const graphiteCollectionName = 'origami.buildservice.' + envName + '.' + processIdentifier;
const data = Measured.createCollection(graphiteCollectionName);

const failures = data.counter('graphiteReportingFailures');

if (graphiteHost) {

	console.info({destHost:graphiteHost+':'+graphitePort}, 'Graphite logging enabled');
	console.info('Graphite collection name: ' + graphiteCollectionName);

	data.gauge('memory', function() {
		return process.memoryUsage().rss;
	});

	blocked(function(ms) {
		if (ms < 100) return;
		data.counter('eventloop.delay').inc(ms);
		data.counter('eventloop.blocks').inc();
	});

	graphite = Graphite.createClient('plaintext://'+graphiteHost+':'+graphitePort);
	timer = setInterval(function() {
		console.log(data.toJSON(), 'Sending graphite data');
		graphite.write(data.toJSON(), function(err) {
			if (err) {

				// Ignore timeouts
				if (err.code === 'ETIMEDOUT' || err.code === 'EPIPE') {
					failures.inc();
					return;
				}

				console.error(err);
				console.warn('Disabling graphite reporting due to error');
				clearInterval(timer);
			}
		});
	}, reportInterval);
	timer.unref();
} else {
	console.warn('Graphite reporting is disabled.  To enable, set GRAPHITE_HOST');
}


module.exports = data;
