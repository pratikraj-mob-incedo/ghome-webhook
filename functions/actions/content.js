var request = require('request');
var moment = require('moment');
var config = require('../config');
var userAction = require('./user');

exports.getPageContent = function(pageID){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent'	:'Super Agent/0.0.1',
			'Authorization'	:config.authToken,
			'x-api-key'		:config.xApiKey
		}
		var fetchContentAPI = config.site.apiBaseUrl + '/content/pages';
		var options = {
			url: fetchContentAPI,
			method: 'GET',
			headers: headers,
			qs: {
				'includeWatchHistory': true,
				'userId': userAction.userInfo.id,
				'includeContent': true,
				'pageId': pageID,
				'site':config.site.internalName
			}
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

exports.searchContent = function(searchTerm){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent'	:'Super Agent/0.0.1',
			'Authorization'	:config.authToken,
			'x-api-key'		:config.xApiKey
		}
		var searchContentAPI = config.site.apiBaseUrl + '/search/v1';
		var options = {
			url: searchContentAPI,
			method: 'GET',
			headers: headers,
			qs: {
				'userId': userAction.userInfo.id,
				'searchTerm': searchTerm.toString(),
				'site':config.site.internalName
			}
		}

		console.log(" Searching content for " + options);

		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			}else{
				reject(error);
			}
		});
	});
}

exports.getContentSingle = function(contentID){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent'	:'Super Agent/0.0.1',
			'Authorization'	:config.authToken,
			'x-api-key'		:config.xApiKey
		}
		var fetchContentAPI = config.site.apiBaseUrl + '/content/videos';
		var options = {
			url: fetchContentAPI,
			method: 'GET',
			headers: headers,
			qs: {
				'userId': userAction.userInfo.id,
				'ids': contentID,
				'site':config.site.internalName
			}
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