var firebase = require('firebase');
var admin = require("firebase-admin");
var config = require('./config');

admin.initializeApp({
  credential: admin.credential.cert(config.firebase.account),
  databaseURL: config.firebase.url
});

var dbConnection = admin.database();

exports.insertData = function(key, data){
	return new Promise(function(resolve, reject){
		dbConnection.ref(key).set(data);
		resolve();
	});
}

exports.retrieveData = function(key){
	return new Promise(function(resolve, reject){
		var ref = dbConnection.ref(key);
		ref.once("value", function(snapshot) {
			if(snapshot.val() !== null){
				resolve(snapshot.val());
			}else{
				resolve(false);
			}
		}, function(err){
			resolve(false);
		});
	});
}