var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var userAction = require('./user');
var contentAction = require('./content');
var platform = require('../platform');
var firebaseDb = require('../firebaseDb');
var ua = require('universal-analytics');
var config = require('../config');

var lastPlayedCourse = null;

exports.sendError = function(app, speechText){
	if(!speechText){
		speechText = "Sorry! There was a glitch. Please try again after some time.";
	}
	platform.googleHome.sendSpeachResponse(app, speechText);
}

exports.getSiteData = function(internalName){
	return new Promise(function(resolve, reject){
		firebaseDb.retrieveData('siteData/' + internalName)
		.then(function(siteData){
			resolve(siteData);
		})
		.catch(function(err){
			reject(err);
		})
	});
}

exports.welcome = function(app){
	var sessionId = app.incomingRequest.sessionId;
	if(userAction.userInfo){
		var firstName = userAction.userInfo.firstName;
		var speechText = "Hi " + firstName;
		platform.googleHome.sendSpeachResponse(app, speechText);
	}else{
		module.exports.sendError(app, "Sorry! We are unable to authenticate you. Make sure you have link your "+config.site.companyName+" account with google home.");
	}
}

exports.getNew = function(app){
	contentAction.getPageContent(config.site.categoriesPageId)
	.then(function(response){
		var contentList = [],
			speechText = '',
			responseText = config.site.actionStack.getNew.responseText,
			categoryName = config.site.actionStack.getNew.categoryMap;

		if(response.categoryMap[categoryName] !== undefined){
			var filteredContent = _.find(response.modules, function(obj){
				if(obj.contentType && obj.contentType.toLowerCase() === 'video' && obj.title.toLowerCase() === categoryName.toLowerCase()){
					return obj.contentData;
				}
				return false;
			});
			contentList = filteredContent.contentData;
		}
		if(contentList.length > 0){
			for(var i = 0; i < contentList.length; i++){
				speechText += contentList[i].gist.title;
				speechText += (parseInt(i + 1) === parseInt(contentList.length)) ? '.' : ', ';
			}
			speechText = responseText ? responseText + ' ' + speechText : config.defaultText.getNew.hasList + ' ' + speechText;
		}else{
			speechText = config.defaultText.getNew.noContent;
		}
		platform.googleHome.sendSpeachResponse(app, speechText);
	})
	.catch(function(error){
		if(error && error.speechText){
			module.exports.sendError(app, error.speechText);
		}else{
			module.exports.sendError(app);
		}
	});
}

exports.getPopular = function(app){
	contentAction.getPageContent(config.site.categoriesPageId)
	.then(function(response){
		var contentList = [],
			speechText = '',
			responseText = config.site.actionStack.getPopular.responseText,
			categoryName = config.site.actionStack.getPopular.categoryMap;
		if(response.categoryMap[categoryName] !== undefined){
			var filteredContent = _.find(response.modules, function(obj){
				if(obj.contentType && obj.contentType.toLowerCase() === 'video' && obj.title.toLowerCase() === categoryName.toLowerCase()){
					return true;
				}
				return false;
			});
			if(filteredContent && filteredContent.contentData){
				contentList = filteredContent.contentData;
			}
		}
		if(contentList.length > 0){
			for(var i = 0; i < contentList.length; i++){
				speechText += contentList[i].gist.title;
				speechText += (parseInt(i + 1) === parseInt(contentList.length)) ? '.' : ', ';
			}
			speechText = responseText ? responseText + ' ' + speechText : config.defaultText.getPopular.hasList + ' ' + speechText;
		}else{
			speechText = config.defaultText.getPopular.noContent;
		}
		console.log("speechText");
		console.log(speechText);
		platform.googleHome.sendSpeachResponse(app, speechText);
	})
	.catch(function(error){
		if(error && error.speechText){
			module.exports.sendError(app, error.speechText);
		}else{
			module.exports.sendError(app);
		}
	});
}