'use strict';

const Qhttp = require('q-io/http');

function Registry() {
}

Registry.prototype = {
	baseURL: 'http://registry.origami.ft.com',

	_packageListPromise: null,
	get packageList() {
		if (!this._packageListPromise) {
			this._packageListPromise = this.refreshPackageList();
		}
		return this._packageListPromise;
	},

	_packageListByURLPromise: null,
	get packageListByURL() {
		if (!this._packageListByURLPromise) {
			this._packageListByURLPromise = this.packageList.then(function(packageList){
				const byURL = {};
				for(let i=0; i < packageList.length; i++) {
					byURL[packageList[i].url] = packageList[i];
				}
				return byURL;
			});
		}
		return this._packageListByURLPromise;
	},

	_clearCache: function() {
		this._packageListPromise = null;
		this._packageListByURLPromise = null;
	},

	refreshPackageList: function() {
		return Qhttp.read(this.baseURL + '/packages').then(function(packageListJSON) {
			try {
				const list = JSON.parse(packageListJSON.toString());

				// Only clear cache once we've successfully got a package list
				this._clearCache();
				return list;
			} catch(e) {
				e.context = packageListJSON;
				throw e;
			}
		}.bind(this)).catch(function(err){
			err.context = this;
			throw err;
		}.bind(this));
	},
};

module.exports = Registry;
