'use strict';

module.exports = {
	backends: require('./backends.json'),
	healthchecks: require('./healthchecks.json'),
	conditions: require('./conditions.json'),
	logging: {
		syslog: [{
			'name': 'Fastly',
			'hostname': 'splunk-syslog.in.ft.com',
			'port': 8443,
			'use_tls': 1,
			'response_condition': 'disable_gui_logs',
			'tls_hostname': 'splunk-syslog.in.ft.com',
			'tls_ca_cert': process.env.TLS_CA_CERT
		}]
	}
};
