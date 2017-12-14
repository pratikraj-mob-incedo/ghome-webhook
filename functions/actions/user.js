var request = require('request');
var moment = require('moment');
var config = require('../config');
var firebaseDb = require('../firebaseDb');
var authData = {
	signature: null,
	signatureTimestamp: null
}

exports.userInfo = null;

// exports.getSignature = function(){
// 	var currentTimestamp = moment().format("YYYY-MM-DDTH:mm:ss").toString() + 'Z';
// 	return new Promise(function(resolve, reject){
// 		if(!authData.signature || authData.signatureTimestamp){
// 			var headers = {
// 				'User-Agent':       'Super Agent/0.0.1',
// 				'Content-Type':     'application/x-www-form-urlencoded'
// 			}
// 			var options = {
// 				url: config.site.apiBaseUrl + '/signature/generate?site='+config.site.internalName+'&timestamp='+ encodeURIComponent(currentTimestamp) + '&access_key='+ config.site.accessKey,
// 				method: 'GET',
// 				headers: headers
// 			}
// 			console.log(options);
// 			request(options, function (error, response, body) {
// 				if (!error && response.statusCode == 200) {
// 					authData.signature = encodeURIComponent(JSON.parse(body).signature);
// 					authData.signatureTimestamp = encodeURIComponent(currentTimestamp);
// 					resolve(authData);
// 				}else{
// 					reject(err);
// 				}
// 			});
// 		}else{
// 			resolve(authData);
// 		}
// 	});
// }

exports.getAutheticationToken = function(){
	return new Promise(function(resolve, reject){
		var authenticationURL = 'https://release-api.viewlift.com/identity/anonymous-token?site=' + config.site.internalName;
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: authenticationURL,
			method: 'GET',
			headers: headers
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}

exports.getUserIdentityToken = function(){
	return new Promise(function(resolve, reject){
		var userIdentityTokenURL = 'https://release-api.viewlift.com/identity-admin/user-token?site=' + config.site.internalName + '&userId=' + exports.userInfo.id;
		var headers = {
			'x-api-key': 	config.xApiKey
		}
		var options = {
			url: userIdentityTokenURL,
			method: 'GET',
			headers: headers
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}

exports.getUserData = function(access_token){
	return new Promise(function(resolve, reject){
		var viewliftOAuthURL = 'https://fqppmaahm9.execute-api.us-east-1.amazonaws.com/release/oauth2/profile?client_id='+config.site.internalName+'&access_token='+access_token.toString();
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: viewliftOAuthURL,
			method: 'GET',
			headers: headers
		}

		request(options, function (error, response, body) {
			body = JSON.parse(body);
			if (!error && response.statusCode == 200 && body.status === 'success') {
				exports.userInfo = body;
				resolve(body);
			}else if(body.message){
				reject({"speechText": body.message});
			}else{
				reject({"speechText": "Sorry! We are unable to authenticate you. Make sure you have link your "+config.site.companyName+" account with google home."});
			}
		});
	});
}

exports.getWatchlist = function(authorizationToken){
	return new Promise(function(resolve, reject){
		var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
		    // 'Authorization': 	authorizationToken
		}
		var viewliftgetWatchlistUrl = 'http://release-api.viewlift.com/user/queues?site=' + config.site.internalName + '&userId=' + exports.userInfo.id + '&offset=0';
		options = {
			url: viewliftgetWatchlistUrl,
			method: 'GET'
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}

exports.getNextBillingDate = function(authorizationToken){
	return new Promise(function(resolve, reject){
		var headers = {
		    'Authorization': 	authorizationToken
		}
		var viewliftgetSubscriptionUrl = 'http://release-api.viewlift.com/subscription/user?site=' + config.site.internalName + '&userId=' + exports.userInfo.id;
		options = {
			url: viewliftgetSubscriptionUrl,
			method: 'GET',
			headers: headers
		}
		request(options, function (error, response, body) {
			console.log("Error is: ", error);
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}

exports.addToWatchlist = function(authorizationToken, contentId, contentType, position){
	return new Promise(function(resolve, reject){
		var headers = {
			'Content-Type': 'application/json',
		    'Authorization': 	authorizationToken
		}
		var addToWatchlistUrl = 'http://release-api.viewlift.com/user/queues?site=' + config.site.internalName;
		options = {
			url: addToWatchlistUrl,
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				'userId'		: exports.userInfo.id,
				'contentType'	: contentType,
				'contentId'		: contentId,
				'position'		: position || 1
			})
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}