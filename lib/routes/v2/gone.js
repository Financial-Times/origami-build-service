'use strict';

module.exports = function(app) {
	app.get([
		'/v2/modules/:module',
		'/__origami/service/build/v2/modules/:module',
	 ], () => {
		const gone = new Error('The modules endpoint no longer exists. There is no direct alternative. For support speak to the Origami team.');
		gone.status = 410;
		throw new Error(gone);
	 });
};
