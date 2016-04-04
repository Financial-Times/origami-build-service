#!/usr/bin/env node
'use strict';

const KonstructorApiClient = require('konstructor-api-client');
const pkg = require('../package.json');
const program = require('commander');

// Command-line configuration
program
	.usage('[options]')
	.option(
		'-g, --gateway <gateway>',
		'a gateway to log the change request to, one of "internal", "konstructor", "mashery", "test". Default: "test"',
		'test'
	)
	.option(
		'-a, --api-key <key>',
		'an API key for use with "konstructor" or "mashery" gateways',
		process.env.KONSTRUCTOR_API_KEY
	)
	.option(
		'-e, --environment <environment>',
		'the environment the change request applies to. One of "Production", "Test", "Development", "Disaster Recovery". Default: "Test"'
	)
	.parse(process.argv);

// Build change request
const type = 'releaselog';
const username = process.env.CIRCLE_USERNAME || process.env.GITHUB_USERNAME;
const summary = `Releasing Origami Build Service version ${pkg.version} to ${program.environment}`;
const description = `Release triggered by ${username}`;
const serviceId = 'origami-buildservice ServiceModule';
const notifyChannel = '#origami-internal';

// We need a username
if (!username) {
	console.error('Please provide a GitHub username in the `GITHUB_USERNAME` environment variable');
	process.exit(1);
}

// Gather up the data
const openData = {
	summaryOfChange: summary,
	changeDescription: description,
	environment: program.environment,
	serviceIds: serviceId,
	notifyChannel: notifyChannel
};
const closeData = {
	notifyChannel: notifyChannel
};

// Create a change request
console.log('Creating a change request');
const apiClient = new KonstructorApiClient(program.gateway, program.apiKey);
KonstructorApiClient.getEmailFromUsername(username)
	.then(email => {
		openData.ownerEmailAddress = openData.resourceOne = closeData.closedByEmailAddress = email;
		return apiClient.createAndCloseChangeRequest(type, openData, closeData);
	})
	.then(changeRequest => {
		console.log('Created and closed change request %s', changeRequest.id);
	})
	.catch(error => {
		if (error.responseBody) {
			console.error(error.message);
			console.error(error.responseBody.message);
		} else {
			console.error(error.stack || error.message);
		}
		process.exit(1);
	});
