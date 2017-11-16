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

exports.getUserData = function(access_token){
	return new Promise(function(resolve, reject){
		var viewliftOAuthURL = 'https://w0mtx2uw84.execute-api.us-east-1.amazonaws.com/prod/oauth2/profile?client_id='+config.site.internalName+'&access_token='+access_token.toString();
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