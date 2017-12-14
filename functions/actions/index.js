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

		var filteredContent = _.find(response.modules, function(obj){
			if(!obj.title){ return false; }
			return obj.title.toLowerCase() === categoryName.toLowerCase();
		});
		if(filteredContent){
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
			if(!obj.title){ return false; }
			return obj.title.toLowerCase() === categoryName.toLowerCase();
		});
		if(filteredContent){
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

exports.categorySearch = function(app){
	if(app.incomingRequest.result.parameters.category){
		const categoryName = app.incomingRequest.result.parameters.category.replace("’", "").trim().toLowerCase();
		contentAction.getPageContent(config.site.categoriesPageId)
		.then(function(response){
			var contentList = [],
				speechText = '',
				responseText = config.site.actionStack.categorySearch.responseText.replace('{category}', categoryName);
			
			var filteredContent = _.find(response.modules, function(obj){
				if(!obj.title){ return false; }
				return obj.title.replace("’", "").trim().toLowerCase() === categoryName.toLowerCase();
			});
			if(filteredContent){
				contentList = filteredContent.contentData;
			}
			if(contentList.length > 0){
				for(var i = 0; i < contentList.length; i++){
					speechText += contentList[i].gist.title;
					speechText += (parseInt(i + 1) === parseInt(contentList.length)) ? '.' : ', ';
				}
				speechText = responseText ? responseText + ' ' + speechText : config.defaultText.categorySearch.hasContent + ' ' + speechText;
			}else{
				speechText = config.defaultText.categorySearch.noContent;
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

exports.describeContent = function(app){
	var speechText = '',
		responseText = config.site.actionStack.describeContent.responseText;
	if(app.incomingRequest.result.parameters.contentName){
		const rawContentName = app.incomingRequest.result.parameters.contentName;
		const contentName = app.incomingRequest.result.parameters.contentName.replace("’", "").replace(/[\W_]+/g,"+").trim().toLowerCase();
		contentAction.searchContent(contentName)
		.then(function(response){
			var content = _.find(response, function(obj){ return obj.gist.title.replace("’", "").replace(/[\W_]+/g,"+").trim().toLowerCase() === contentName; });
			if(content){
				speechText += content.gist.description;
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

exports.getWatchlist = function(app){
	var speechText = '',
		responseText = config.site.actionStack.getWatchlist.responseText;
	
	userAction.getAutheticationToken()
	.then(function(response){
		return userAction.getWatchlist(response.authorizationToken);
	})
	.then(function(response){
		if(response.records.length > 0){
			var contentList = response.records;
			for(var i = 0; i < contentList.length; i++){
				speechText += contentList[i].contentResponse.gist.title;
				speechText += (parseInt(i + 1) === parseInt(contentList.length)) ? '.' : ', ';
			}
			speechText = responseText ? responseText.replace('{n}', parseInt(contentList.length)) + ' ' + speechText : config.defaultText.categorySearch.hasContent + ' ' + speechText;
		}else{
			speechText = config.defaultText.getWatchlist.noContent;
		}
		platform.googleHome.sendSpeechResponse(app, speechText);
	})
	.catch(function(err){
		console.log(err);
		module.exports.sendError(app, "Sorry! We could not fetch your watchlist right now.");
	});
}

exports.getNextBillingDate = function(app){
	var speechText = '';
	
	userAction.getUserIdentityToken()
	.then(function(response){
		console.log("authorizationToken = " + response.authorizationToken);
		return userAction.getNextBillingDate(response.authorizationToken);
	})
	.then(function(response){
		if(response.subscriptionInfo){
			var nextBillingDate = moment(new Date(response.subscriptionInfo.subscriptionEndDate)).format("YYYY-MM-DD"),
				subscriptionStatus = response.subscriptionInfo.subscriptionStatus;

			speechText = config.defaultText.nextBillingDate[subscriptionStatus].replace('{date}', nextBillingDate);
		}else{
			speechText = "Sorry! We could not fetch your subscription details right now.";
		}
		platform.googleHome.sendSpeechResponse(app, speechText);
	})
	.catch(function(err){
		console.log(err);
		module.exports.sendError(app, "Sorry! We could not fetch your subscription details right now.");
	});
}

exports.addToWatchlist = function(app){
	var speechText = '',
		responseText = config.site.actionStack.addToWatchlist.responseText,
		contentId = null,
		contentTitle = null,
		contentType = null;
	if(app.incomingRequest.result.parameters.contentName){
		const rawContentName = app.incomingRequest.result.parameters.contentName;
		const contentName = app.incomingRequest.result.parameters.contentName.replace("’", "").replace(/[\W_]+/g,"+").trim().toLowerCase();
		contentAction.searchContent(contentName)
		.then(function(response){
			var content = _.find(response, function(obj){ return obj.gist.title.replace("’", "").replace(/[\W_]+/g,"+").trim().toLowerCase() === contentName; });
			if(content){
				contentId = content.gist.id;
				contentType = content.gist.contentType;
				contentTitle = content.gist.title;
				return userAction.getUserIdentityToken();
			}else{
				throw new Error({'speechText': config.defaultText.addToWatchlist.failed.replace('{contentName}', rawContentName)});
			}
		})
		.then(function(response){
			return userAction.addToWatchlist(response.authorizationToken, contentId, contentType, 1);
		})
		.then(function(response){
			speechText = responseText ? responseText.replace('{contentName}', contentTitle) : config.defaultText.addToWatchlist.success.replace('{contentName}', contentTitle);
			platform.googleHome.sendSpeechResponse(app, speechText);
		})
		.catch(function(error){
			console.log("An error occured");
			console.log(error);
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