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
	platform.googleHome.sendSpeechResponse(app, speechText);
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
		platform.googleHome.sendSpeechResponse(app, speechText);
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
			speechText = responseText ? responseText + ' ' + speechText : config.defaultText.getNew.hasContent + ' ' + speechText;
		}else{
			speechText = config.defaultText.getNew.noContent;
		}
		platform.googleHome.sendSpeechResponse(app, speechText);
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

		var filteredContent = _.find(response.modules, function(obj){
			return (obj.contentType && obj.contentType.toLowerCase() === 'video' && obj.title.toLowerCase() === categoryName.toLowerCase());
		});
		if(filteredContent && filteredContent.contentData){
			contentList = filteredContent.contentData;
		}
		if(contentList.length > 0){
			for(var i = 0; i < contentList.length; i++){
				speechText += contentList[i].gist.title;
				speechText += (parseInt(i + 1) === parseInt(contentList.length)) ? '.' : ', ';
			}
			speechText = responseText ? responseText + ' ' + speechText : config.defaultText.getPopular.hasContent + ' ' + speechText;
		}else{
			speechText = config.defaultText.getPopular.noContent;
		}
		platform.googleHome.sendSpeechResponse(app, speechText);
	})
	.catch(function(error){
		if(error && error.speechText){
			module.exports.sendError(app, error.speechText);
		}else{
			module.exports.sendError(app);
		}
	});
}

exports.describeContent = function(app){
	var speechText = '',
		responseText = config.site.actionStack.describeContent.responseText;
	if(app.incomingRequest.result.parameters.contentName){
		const rawContentName = app.incomingRequest.result.parameters.contentName;
		const contentName = app.incomingRequest.result.parameters.contentName.replace("’", "").replace(/[\W_]+/g,"").trim().toLowerCase();
		contentAction.searchContent(contentName)
		.then(function(response){
			var content = _.find(response, function(obj){ return obj.gist.title.replace("’", "").replace(/[\W_]+/g,"").trim().toLowerCase() === contentName; });
			if(content){
				speechText += content.gist.logLine;
				config.defaultText.describeContent.hasContent = config.defaultText.describeContent.hasContent.replace('{contentName}', rawContentName);
				speechText = responseText ? responseText + ' ' + speechText : config.defaultText.describeContent.hasContent + ' ' + speechText;
			}else{
				speechText = config.defaultText.describeContent.noContent;
			}
			platform.googleHome.sendSpeechResponse(app, speechText);
		})
		.catch(function(error){
			if(error && error.speechText){
				module.exports.sendError(app, error.speechText);
			}else{
				module.exports.sendError(app);
			}
		});
	}else{
		module.exports.sendError(app, "Sorry! I culd not undersatand what you are looking for.");
	}
}