'use strict';

function Average(unit) {
	this.unit = unit;
	this._samples = 0;
	this._total = 0;
	this.latest = undefined;
	this.min = Infinity;
	this.max = -Infinity;
	this.since = new Date();
	this.lastUpdated = null;
	this._pendingReset = false;
}

Average.prototype = {
	get value() {
		return this._total/this._samples;
	},

	valueOf: function() {
		return this.latest;
	},

	/**
	 * Size of window for moving average, in seconds
	 */
	get period() {
		return this.lastUpdated ? (this.lastUpdated - this.since)/1000 : 0;
	},

	add: function(value) {
		if (this._pendingReset) Average.call(this, this.unit);

		this.lastUpdated = new Date();
		this.latest = value;
		if (this.min > value) this.min = value;
		if (this.max < value) this.max = value;
		this._total += value;
		this._samples++;
	},

	/**
	 * Next add() will reset counters
	 * Can't reset immediately as then this.value would become NaN
	 */
	reset: function() {
		this._pendingReset = true;
	},

	getAsFTMetric: function() {
		return {
			type: 'movingaverage',
			period: this.period,
			mean: this.value,
			min: this.min,
			max: this.max,
			unit: this.unit,
			since: this.since.toISOString(),
			lastUpdated: this.lastUpdated ? this.lastUpdated.toISOString() : null,
		};
	}
};

module.exports = Average;
