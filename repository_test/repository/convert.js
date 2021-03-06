function EpisodeParser() {
	this.streams = [];
	this.frameList = [];

	var metadata = {};
	var blackboard = null;

	function parseBlackboard(blackboards) {
		blackboard = { frames:[] };
		for (var i=0; i<blackboards.length; ++i) {
			var currentBlackboard = blackboards[i];
			if (!blackboard.duration) {
				blackboard.duration = metadata.duration;
			}
			if (!blackboard.mimetype) {
				blackboard.mimetype = currentBlackboard.mimetype;
			}
			if (!blackboard.res) {
				blackboard.res = { w:0, h:0 };
			}

			if (/(\d+):(\d+):(\d+)/.test(currentBlackboard.time)) {
				var time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
				var src = (currentBlackboard.thumb.url);

				blackboard.frames.push({ time:time, src:src });
			}
		}
	}

	function isStreaming(trackUrl) {
		return /rtmp:\/\//.test(trackUrl);
	}

	function getStreamSource(track) {
		var res = [0,0];
		if(track.mediainfo && (track.mediainfo.video instanceof Object)) {
			res = track.mediainfo.video.resolution.split('x');
		}

		var source = {
			src:  track.url,
			mimetype: track.mimetype,
			res: {w:res[0], h:res[1]},
			isLiveStream: track.live
		};
		if (track.live) {
			source.isLiveStream = true;
		}

		return source;
	}

	function parseMetadata(sourceMetadata) {
		metadata.duration = sourceMetadata.duration/1000;
		metadata.title = sourceMetadata.title;
	}

	this.getOutput = function() {
		var data = {
			metadata:metadata,
			streams:this.streams
		};

		if (this.frameList && this.frameList.length>0) {
			data.frameList = this.frameList;
		}

		if (this.captions) {
			data.captions = this.captions;
		}

		if (blackboard) {
			data.blackboard = blackboard;
		}

		return JSON.stringify(data, null, "\t");
	}

	this.parse = function(filePath) {
		var episode = require('./' + filePath);
		this.path = filePath.split('/');
		this.path.pop();
		this.path = this.path.join('/') + '/';

		var streams = {};
		var metadata =[];
		metadata['duration'] = episode.mediapackage.duration/1000;
		metadata['title'] = episode.mediapackage.title; 
		//console.log(metadata); return false;
		var tracks = episode.mediapackage.media.track;
		var attachments = episode.mediapackage.attachments.attachment;

		// Read the tracks!!
		for (var i=0; i<tracks.length; ++i) {
			var currentTrack = tracks[i];
			var currentStream = streams[currentTrack.type];
			if (currentStream == undefined) { currentStream = { sources:{}, preview:'' }; }

			if (isStreaming(currentTrack.url)) {
				if ( !(currentStream.sources['rtmp']) || !(currentStream.sources['rtmp'] instanceof Array)){
					currentStream.sources['rtmp'] = [];
				}
				currentStream.sources['rtmp'].push(getStreamSource(currentTrack))
			}
			else{
				var videotype = null;
				switch (currentTrack.mimetype) {
					case 'video/mp4':
					case 'video/ogg':
					case 'video/webm':
						videotype = currentTrack.mimetype.split("/")[1];
						break;
					case 'video/x-flv':
						videotype = 'flv';
						break;
					default:
						paella.debug.log('StandAloneVideoLoader: MimeType ('+currentTrack.mimetype+') not recognized!');
					break;
				}
				if (videotype){
					if ( !(currentStream.sources[videotype]) || !(currentStream.sources[videotype] instanceof Array)){
						currentStream.sources[videotype] = [];
					}
					currentStream.sources[videotype].push(getStreamSource(currentTrack));
				}
			}

			currentStream.preview = currentTrack.preview;
			streams[currentTrack.type] = currentStream;
		}

		var presenter = streams["presenter/delivery"];
		var presentation = streams["presentation/delivery"];

		// Read the slides
		if (attachments) {
			var duration = parseInt(episode.mediapackage.duration/1000);	
			var imageSource =   {type:"image/jpeg", frames:[], count:0, duration: duration, res:{w:320, h:180}};
			var imageSourceHD = {type:"image/jpeg", frames:[], count:0, duration: duration, res:{w:1280, h:720}};
			var blackboardSource = {type:"image/jpeg", frames:[], count:0, duration: duration, res:{w:1280, h:720}};
			var thumbSource = {mimetype:"image/jpeg", frames:[], count:0, duration: duration, res:{w:1280, h:720}};

			for (var i=0; i<attachments.length; ++i) {
				var currentAttachment = attachments[i];

				if (currentAttachment.type == "blackboard/image") {
					if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
						time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
						
						blackboardSource.frames["frame_"+time] = currentAttachment.url;
						blackboardSource.count = blackboardSource.count +1;                	
					}
				
				}
				else if (currentAttachment.type == "presentation/segment+preview+hires") {
					if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
						time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
						imageSourceHD.frames["frame_"+time] = currentAttachment.url;
						imageSourceHD.count = imageSourceHD.count +1;
					}
				}
				else if (currentAttachment.type == "presentation/segment+preview") {
					if (/time=T(\d+):(\d+):(\d+)/.test(currentAttachment.ref)) {
						var time = parseInt(RegExp.$1)*60*60 + parseInt(RegExp.$2)*60 + parseInt(RegExp.$3);
						console.log("######## ---- "+time+" ----########");
						console.log(currentAttachment.url);
						imageSource.frames["frame_"+time] = currentAttachment.url;
						imageSource.count = imageSource.count +1;
						
						url = currentAttachment.url;

						imageSource.frames.push({ time:time, src:url });
						imageSource.count = imageSource.count +1;
						thumbSource.frames.push({ time:time, src:url });
						thumbSource.count = thumbSource.count +1;

						this.frameList.push({id:'frame_'+time, mimetype:currentAttachment.mimetype, time:time, url:url, thumb:url});
					}
				}
				else if (currentAttachment.type == "presentation/player+preview") {
					presentation.preview = currentAttachment.url;
				}
				else if (currentAttachment.type == "presenter/player+preview") {
					presenter.preview = currentAttachment.url;
				}
			}

			// Set the image stream
		var imagesArray = [];
		if (imageSourceHD.count > 0) { imagesArray.push(imageSourceHD); }
		if (imageSource.count > 0) { imagesArray.push(imageSource); }
		if ( (imagesArray.length > 0) && (presentation != undefined) ){
			presentation.sources.image = imagesArray; 
		}
		
		// Set the blackboard images
		var blackboardArray = [];
		if (blackboardSource.count > 0) { blackboardArray.push(blackboardSource); }		
		if ( (blackboardArray.length > 0) && (presenter != undefined) ){
			presenter.sources.image = blackboardArray;
		}


		// Read the blackboard
		/*if (blackboards) {
			parseBlackboard(blackboards);
		}*/

		// Finaly push the streams
		if (presenter) { this.streams.push(presenter); }
		if (presentation) { this.streams.push(presentation); }

		// Load Captions
		this.captions = episode.mediapackage.captions;
	}
	};
};

if (process.argv.length<3) {
	console.log("usage: node convert.js in_file");
}
else {
	var fs = require('fs');
	var outFilePath = process.argv[2].split('/');
	outFilePath.pop();
	outFilePath = outFilePath.join('/') + '/data.json';

	var parser = new EpisodeParser();
	parser.parse(process.argv[2]);
	fs.writeFileSync(outFilePath,parser.getOutput());
}
