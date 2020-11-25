'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const navigation = require('../../../data/navigation.json');
module.exports = app => {
	// v2 home page
	app.get('/v2', cacheControl({maxAge: '7d'}), (request, response) => {
		navigation.items.map(item => item.current = false);
		navigation.items[0].current = true;
		response.render('index', {
			title: 'Origami Build Service',
			layoutStyle: 'o-layout--landing',
			navigation
		});
	});
};
