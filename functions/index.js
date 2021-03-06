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

	// Content Specific Action Map
	actionMap.set("getNew", actions.getNew);
	actionMap.set("getPopular", actions.getPopular);
	actionMap.set("categorySearch", actions.categorySearch);
	actionMap.set("describeContent", actions.describeContent);

	// User Specific Action Map
	actionMap.set("getWatchlist", actions.getWatchlist);
	actionMap.set("addToWatchlist", actions.addToWatchlist);
	actionMap.set("nextBillingDate", actions.getNextBillingDate);

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
		console.log("An error occured");
		console.log(err);
		if(err.speechText){
			actions.sendError(app, err.speechText);
		}else{
			actions.sendError(app);
		}
	});
});