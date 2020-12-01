'use strict';

const requestPromise = require('./utils/request-promise');

class Registry {
	constructor({
		bowerRegistryURL = 'http://origami-bower-registry.ft.com'
	} = {}) {
		this.bowerRegistryURL = bowerRegistryURL;
	}

	packageListByURL() {
		return this.getPackageList().then(packageList => {
			const byURL = packageList.reduce((obj, pkg) => {
				obj[pkg.url] = pkg;
				return obj;
			}, {});
			return byURL;
		});
	}

	getPackageList() {
		return requestPromise({
			url: this.bowerRegistryURL + '/packages',
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
