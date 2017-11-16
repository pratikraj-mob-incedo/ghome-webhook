const functions = require('firebase-functions');
const ApiAiApp = require('actions-on-google').ApiAiApp;
var firebase = require('firebase');
var http = require('http');
var moment = require('moment');
var request = require("request");
var _ = require('lodash');

var config = require('./config');
var actions = require('./actions');
var userAction = require('./actions/user');

exports.gHomeWebhook = functions.https.onRequest((request, response) => {
	const internalName = request.query.client_id;
	const app = new ApiAiApp({request: request, response: response});
	const sessionId = request.body.sessionId;

	app.incomingRequest = request.body;
	
	const actionMap = new Map();
	const action = app.getIntent();

	console.log("action is " + action);

	actionMap.set("welcome", actions.welcome);
	actionMap.set("getNew", actions.getNew);

	var user = app.getUser();

	actions.getSiteData(internalName)
	.then(function(response){
		console.log("Site data fetched from firebase.");
		config.setConfigData('site', response);
		config.setConfigData('defaultText', require('./config/defaultText/' + response.category + '.js'));
		return userAction.getUserData(user.access_token);
	})
	.then(function(response){
		console.log("User data fetched from AppCMS.");
		app.handleRequest(actionMap);
	})
	.catch(function(err){
		if(err.speechText){
			actions.sendError(app, err.speechText);
		}else{
			actions.sendError(app);
		}
	});
});