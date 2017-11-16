var request = require('request');
var moment = require('moment');
var config = require('../config');

exports.getFeaturedCourses = function(authData){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: 'http://api.viewlift.com/apis/svod/featured/shows.json',
			method: 'GET',
			headers: headers,
			qs: {
				'access_key': config.Snag.accessKey,
				'signature': authData.signature,
				'timestamp': authData.signatureTimestamp,
				'site':'tgc'
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

exports.searchCourse = function(courseName, authData){
	var currentTimestamp = moment().format("YYYY-MM-DD H:mm:ss");
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: config.apiBase + '/svod/search.json',
			method: 'GET',
			headers: headers,
			qs: {
				'type': 'show',
				'searchTerm': courseName.toString(),
				'access_key': config.Snag.accessKey,
				'signature': authData.signature,
				'timestamp': authData.signatureTimestamp,
				'site':'tgc'
			}
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200 && JSON.parse(body) !== undefined) {
				if(JSON.parse(body).results && JSON.parse(body).results.length > 0){
					resolve(JSON.parse(body));
				}else{
					reject(error);
				}
			}else{
				reject(error);
			}
		});
	});
}

exports.searchEpisode = function(courseName, authData){
	var currentTimestamp = moment().format("YYYY-MM-DD H:mm:ss");
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: config.apiBase + '/svod/search.json',
			method: 'GET',
			headers: headers,
			qs: {
				'type': 'episode',
				'searchTerm': courseName.toString(),
				'access_key': config.Snag.accessKey,
				'signature': authData.signature,
				'timestamp': authData.signatureTimestamp,
				'site':'tgc'
			}
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200 && JSON.parse(body) !== undefined) {
				if(JSON.parse(body).results && JSON.parse(body).results.length > 0){
					resolve(JSON.parse(body));
				}else{
					reject(error);
				}
			}else{
				reject(error);
			}
		});
	});
}

exports.getCourseDetails = function(courseId, authData){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			// url: config.apiBase + '/svod/show/' + courseId + '.json',
			url: config.apiBase + '/svod/show/' + courseId + '.json?access_key=' + config.Snag.accessKey + '&signature=' + authData.signature + '&timestamp=' + authData.signatureTimestamp + '&site=tgc&user_id=null&uid=null',
			method: 'GET',
			headers: headers,
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

exports.getLectureAudioUrl = function(lectureId, authData){
	return new Promise(function(resolve, reject){
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded'
		}
		var options = {
			url: config.apiBase + '/svod/film/' + lectureId + '/renditions.json?access_key=' + config.Snag.accessKey + '&signature=' + authData.signature + '&timestamp=' + authData.signatureTimestamp + '&site=tgc',
			method: 'GET',
			headers: headers
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body).film.audioRenditions[0].url);
			}else{
				reject(error);
			}
		});
	});
}