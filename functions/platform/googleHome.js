exports.sendSpeachResponse = function(app, speachText){
	var text_to_speech = '<speak>'+speachText+'</speak>';  
	app.ask(text_to_speech);
}

exports.sendAudioResponse = function(app, speachText, audioUrl){
	// audioUrl = 'https://us-central1-viewlift-3e7a8.cloudfunctions.net/getAudioChunks';
	var text_to_speech = '<speak>' + speachText + '<audio src="' + audioUrl + '"></audio></speak>';
	app.ask(text_to_speech);
}