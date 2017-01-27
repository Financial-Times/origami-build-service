'use strict';

const requestPromise = require('./utils/request-promise');

class Registry {
	constructor({
		registryURL = 'http://registry.origami.ft.com'
	} = {}) {
		this.registryURL = registryURL;
	}

	packageListByURL() {
		return this.refreshPackageList().then(packageList => {
			const byURL = packageList.reduce((obj, pkg) => {
				obj[pkg.url] = pkg;
				return obj;
			}, {});
			return byURL;
		});
	}

	refreshPackageList() {
		return requestPromise({
			url: this.registryURL + '/packages',
			json: true
		})
		.then(response => {
			const list = response.body;
			return list;
		}).catch((err) => {
			err.context = this;
			throw err;
		});
	}
}

module.exports = Registry;
