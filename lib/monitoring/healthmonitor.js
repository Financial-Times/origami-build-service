'use strict';

const Q = require('./../utils/q');
const net = require('net');
const os = require('os');
const diskspace = require('diskspace');
const Average = require('./movingaverage');

function HealthMonitor(options) {
	this.checkResults = {};
	this.log = options && options.log;
}

HealthMonitor.prototype = {
	checkResults: null,

	addSystemLoadCheck: function(info) {
		return this.addCheck(Object.assign({
			name: 'System load',
			businessImpact: 'The server may be slow to respond and requests may time out causing intermittent failures',
			severity: 3,
			checkPeriod: 5,
		}, info),
		function(){
			const load = os.loadavg();
			if (load[1] > 10) throw new Error('Load too high (' + load[0] + ')'); // load[1] to allow temporary spikes
			return load[0];
		});
	},

	addCheck: function(info, callback) {
		if (!info.name) throw new Error('Missing name field');

		const periodSeconds = info.checkPeriod || 60;
		delete info.checkPeriod;

		const checkLoop = function() {
			return Q.fcall(callback).then(function(output){
				// info.ok can be undefined if no test has run yet, and in that case don't output 'recovered'
				if (false === info.ok && this.log) {
					this.log.info({checkName: info.name}, 'Healthcheck recovered');
				}
				info.ok = true;
				if (output) {
					info.checkOutput = output;
				} else {
					delete info.checkOutput;
				}
			}.bind(this), function(err) {
				if ((info.ok || 'undefined' === typeof info.ok) && this.log) {
					this.log.warn({
						checkName:info.name,
						checkOutput:err.message,
						severity:info.severity,
						lastUpdated:info.lastUpdated
					}, 'Healthcheck failed');
				}
				info.ok = false;
				info.checkOutput = err.message;
			}.bind(this))
			.finally(function(){
				info.lastUpdated = (new Date()).toISOString();
				this.checkResults[info.name] = info;
			}.bind(this));
		}.bind(this);

		// Run once, then start on an interval
		return checkLoop().finally(function() {
			// Add jitter to the interval avoid running all the checks at the same time
			const interval = setInterval(function() { checkLoop().done(); }, (periodSeconds + Math.random() - 0.5) * 1000);
			interval.unref();
		});
	},

	addTcpIpCheck: function(info, host, port) {
		const aggregator = new Average('ms');
		return this.addCheck(info, function() {
			if (!port) return Q.reject('Unknown TCP/IP port for ' + host);
			if (!host) return Q.reject('Missing host (TCP/IP port ' + port + ')');

			const def = Q.defer();
			const start = Date.now();
			const sock = net.connect(port, host);
			sock.on('connect', function(){
				sock.destroy();
				aggregator.add(Date.now() - start);
				def.resolve(aggregator.value);
			});
			sock.on('error', function(err){
				sock.destroy();
				def.reject(err);
			});

			return Q.maxWait(5000, def.promise, 'Connection to ' + host + ':' + port).finally(function() {
				if (sock) { sock.destroy(); }
			});
		});
	},

	addMemoryChecks: function(info) {
		const availableMemory = os.totalmem(); // In bytes
		const maxMemUsage = availableMemory * 0.75; // Start alerting when memory usage > 75% (In bytes)

		const checks = [
			[Object.assign({name:'Memory RSS'}, info), 'rss'],
			[Object.assign({name:'Memory heap total'}, info), 'heapTotal'],
			[Object.assign({name:'Memory heap used'}, info), 'heapUsed'],
		];
		return Q.all(checks.map(function(check){
			const info = check[0];
			const propName = check[1];

			const aggregate = new Average('bytes');
			return this.addCheck(info, function(){
				let value = process.memoryUsage()[propName];
				if (value > maxMemUsage) {
					// If the memory threshold has been reached for the used heap, force global gc before reporting (only available if exposed through --expose_gc)
					if (propName === 'heapUsed' && global.gc) {
						if (this.log) { this.log.info('Forcing GC'); }
						global.gc();
						value = process.memoryUsage()[propName];
					}

					if (value > maxMemUsage) {
						throw new Error(info.name + ' is ' + value + ' (maximum expected is ' + maxMemUsage + ')');
					}
				}
				aggregate.add(value);
				return aggregate.value;
			}.bind(this));
		}.bind(this)));
	},

	addDiskChecks: function(info, drive) {
		const minInodesFree = 10000; // 10K files
		const minBytesFree = 50*1024*1024; // 50MB

		const inodesAgg = new Average('inodes');
		const bytesAgg = new Average('bytes');

		const inodesCheck = this.addCheck(Object.assign({name:'Free disk inodes'}, info), function(){
			return Q.nfcall(diskspace.check, drive, {inodes:true}).then(function(res){
				if ('number' !== typeof res.ifree) {
					throw new Error('diskcheck was unable to read number of free inodes');
				}
				inodesAgg.add(res.ifree);
				if (!res.ifree || res.ifree < minInodesFree) {
					throw new Error('Inodes space low (' + res.ifree + '/' + res.itotal + ')');
				}
				return inodesAgg.value;
			});
		});

		const diskBytesCheck = this.addCheck(Object.assign({name:'Free disk bytes'}, info), function(){
			return Q.nfcall(diskspace.check, drive, {inodes:false}).then(function(res){
				if ('number' !== typeof res.free) {
					throw new Error('diskcheck was unable to read number of free blocks');
				}
				bytesAgg.add(res.free);
				if (!res.free || res.free < minBytesFree) {
					throw new Error('Disk space low (' + res.free + '/' + res.total + ' bytes)');
				}
				return bytesAgg.value;
			});
		});

		return Q.all([diskBytesCheck, inodesCheck]);
	},

	getCheckResults: function() {
		const checks = [];
		for(const name in this.checkResults) {
			if (this.checkResults.hasOwnProperty(name)) {
				checks.push(this.checkResults[name]);
			}
		}
		checks.sort(function(a,b){return a.name.localeCompare(b.name);});
		return checks;
	},
};

module.exports = HealthMonitor;
