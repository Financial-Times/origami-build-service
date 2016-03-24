'use strict';

const Graphite = require('graphite');
const Measured = require('measured');
const blocked = require('blocked');
const log = require('../utils/log');

const reportInterval = 5000;
const graphiteHost = process.env.GRAPHITE_HOST || null;
const graphitePort = process.env.GRAPHITE_PORT || 2003;
const envName = process.env.NODE_ENV || 'unknown';
const processIdentifier = process.env.DYNO ? 'dyno-' + process.env.DYNO.replace('.', '') : 'pid-' + process.pid;

let timer = null;
let graphite = null;
const graphiteCollectionName = 'origami.buildservice.' + envName + '.' + processIdentifier;
const data = Measured.createCollection(graphiteCollectionName);

const failures = data.counter('graphiteReportingFailures');

if (graphiteHost) {

	log.info({destHost:graphiteHost+':'+graphitePort}, 'Graphite logging enabled');
	log.info('Graphite collection name: ' + graphiteCollectionName);

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
		log.trace(data.toJSON(), 'Sending graphite data');
		graphite.write(data.toJSON(), function(err) {
			if (err) {

				// Ignore timeouts
				if (err.code === 'ETIMEDOUT' || err.code === 'EPIPE') {
					failures.inc();
					return;
				}

				log.error(err);
				log.warn('Disabling graphite reporting due to error');
				clearInterval(timer);
			}
		});
	}, reportInterval);
	timer.unref();
} else {
	log.warn('Graphite reporting is disabled.  To enable, set GRAPHITE_HOST');
}


module.exports = data;
