var http = require("http");
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var assert = require('assert');
var router = require('./router.js');

function start(){
function onRequest(request, response) {
  if(request.url === '/favicon.ico'){
    console.log("SHIT happens");  
  }else{

  if(request.method === 'POST'){
    var body = '';
    request.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)
      request.connection.destroy();
    });
    request.on('end', function () {
      var post = querystring.parse(body);
      console.log(post);
      // use post['blah'], etc.
      var content = router.route(post, response);
    });
  };



  }
  
  
  /*response.write(content);
  response.end();*/

  /*if(request.url === '/favicon.ico'){
  	console.log("Favicon was requested");
  	var img = fs.readFileSync('./public/images/favicon.ico');
    response.writeHead(200, {"Content-Type": "image/x-icon"});
    response.end(img,'binary');
  } else {
    console.log("Request was received.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }*/
};
http.createServer(onRequest).listen(8887);
console.log("Server has started its hard and meaningful work.");
};

exports.start = start;