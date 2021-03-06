/**
* @simple server
*/
var PORT = 3000;
var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');

var mine = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

//exports
var server = module.exports = {};

/**
* @init
*/
server.init = function(serverCurrentDir){
	var config = http.createServer(function (request, response) {
		var pathname = url.parse(request.url).pathname;
		if (typeof(serverCurrentDir) == 'undefined') {
			var realPath = fs.realpathSync('.') +'/'+ pathname;
		}else {
			var realPath = serverCurrentDir +'/'+ pathname;
		}

		var ext = path.extname(realPath);
		ext = ext ? ext.slice(1) : 'unknown';

		fs.exists(realPath, function (exists) {
			if (!exists) {
				response.writeHead(404, {
					'Content-Type': 'text/plain'
				});

				response.write("This request URL " + pathname + " was not found on this server.");
				response.end();
			} else {
				fs.readFile(realPath, "binary", function (err, file) {
					if (err) {
						if(err.errno == 28){
							response.writeHead(200, {
								'Content-Type': mine.html
							});
							var html = server.getDirList(realPath, pathname);
							response.write(html);
							response.end();
						}else{
							response.writeHead(500, {
								'Content-Type': mine.html
							});
							response.end(err);
						}
					} else {
						var contentType = mine[ext] || "text/plain";
						response.writeHead(200, {
							'Content-Type': contentType
						});
						response.write(file, "binary");
						response.end();
					}
				});
			}
		});
	});
	config.listen(PORT);
}

/**
* @get dir list
*/
server.getDirList = function(realPath, pathname){
	var html = '';
	realPath = path.normalize(realPath);
	pathname = pathname.replace(/\//,'');

	fs.readdirSync(realPath).forEach(function(name){
		html += '<li><a href="'+pathname +'/'+name+'">'+name+'</a></li> '
	})
	
	if (html != '') {
		html = '<ul>' +html+ '</ul>';
	}

	return html;
}
