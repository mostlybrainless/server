var express = require('express');
var session = require('client-sessions');
var router = require('./router.js');
var http = require("http");
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var oauth = require('oauth');


var app = express();
var twitterConsumerKey = 'FxM5LnmmQ4cjKMhVy6G5goujz';
var twitterConsumerKeyToken = '1FfegLHvyI1cTsAsI3rJukjewkw7Wc1KCe9XeJlzNG8M7IQFuP';

app.use(session({cookieName:'mySession',
	secret: 'Naaspeoritmgednjykavlol;d34355twevt43!@#i',
	duration: 5 * 1000,
	activeDurtion: 5 * 1000
}));

var consumer = new oauth.OAuth(
	"https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
	twitterConsumerKey, twitterConsumerKeyToken, "1.0A", "http://localhost:8887/wow", "HMAC-SHA1"
);


app.get('/twitter', function(req, res){
  consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
  	assert.equal(null, error);
    req.mySession.oauthRequestToken = oauthToken;
    console.log("REQUEST_TOKEN=", oauthToken);
    req.mySession.oauthRequestTokenSecret = oauthTokenSecret;
    res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token="+req.mySession.oauthRequestToken);      
  });
});


app.get('/wow', function(req, res){
  console.log(req.mySession.oauthRequestToken);
  console.log(req.mySession.oauthRequestTokenSecret);
  console.log(req.query.oauth_verifier);
  consumer.getOAuthAccessToken(req.mySession.oauthRequestToken, req.mySession.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
  	assert.equal(error, null);
    req.mySession.oauthAccessToken = oauthAccessToken;
    req.mySession.oauthAccessTokenSecret = oauthAccessTokenSecret;
      
    res.redirect('/home');
  });
});

app.get('/home', function(req, res){
    consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.mySession.oauthAccessToken, req.mySession.oauthAccessTokenSecret, function (error, data, response) {
      if (error) {

      	  //TODO: CHANGE. WRITE HTML "U R LOKH"
      	  res.writeHead(403, {"Content-Type": "text/html"});
          res.write("<html><head><title>Some fancy website</title></head><body>You are not allowed. Your login or password is incorrect<form action=\"http://localhost:8887\" method=\"post\">Login:<br><input type=\"text\" name=\"login\"><br>Password:<br><input type=\"password\" name=\"psw\"><br><input type=\"radio\" name=\"type_in\" value=\"signin\">Sign-in<br><input type=\"radio\" name=\"type_in\" value=\"login\">Log-in<br><input type=\"submit\" value=\"Signin\"></form><br><a href=\"http://localhost:8887/twitter\">Sign in with Twitter</a></body></html>")
          res.end();
          // res.send("Error getting twitter screen name : " + util.inspect(error), 500);
      } else {
          var parsedData = JSON.parse(data);

        // req.session.twitterScreenName = response.screen_name; 
        
        req.mySession.user=parsedData.screen_name;
        var url = 'mongodb://localhost:27017/test';
		MongoClient.connect(url, function(err, db){
			entry={};
			entry["login"]=parsedData.screen_name;
			entry["psw"]="twitter-based";
			db.collection('restaurants').insert(entry, function(err){
				assert.equal(err, null);
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write("<html><head></head><body>Your login is " + entry["login"] + ". And your password is "
          + entry["psw"] + ". Hello!<br><form action=\"http:\/\/localhost:8887\/quit\/\" method=\"get\"><input type=\"submit\" value=\"Logout\"></form></body></html>");
				res.end();
			});
		});
      } 
    });
});












app.get('/', function(req, res){
	console.log('BLYAMBA GET');
	if(req.mySession && req.mySession.user){
		var url = 'mongodb://localhost:27017/test';
		MongoClient.connect(url, function(err, db){
			assert.equal(null, err);
			var entry = {};
			entry["login"]=req.mySession.user;
			db.collection('restaurants').find(entry).toArray(
				function(err, docs){
					assert.equal(null, err);
					if(docs.length>0){
						res.writeHead(200, {"Content-Type": "text/html"});
						res.write("<html><head></head><body>Your login is " + docs[0]["login"] + ". And your password is "
          + docs[0]["psw"] + ". Hello!<br><form action=\"http:\/\/localhost:8887\/quit\/\" method=\"get\"><input type=\"submit\"></form></body></html>");
						res.end();
					} else {
						fs.readFile('index.html', function(err, data){
							assert.equal(err, null);
							res.writeHead(200, {"Content-Type": "text/html"});
							res.write(data);
							res.end();
						});
						
					};
				}
			);
		});
	} else {
		fs.readFile('index.html', function(err, data){
			assert.equal(err, null);
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write(data);
			res.end();
		});
	};
});


app.post('/', function(request, response){
	console.log('BLYAMBA POST');
    var body = '';
    request.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6)
      request.connection.destroy();
    });
    request.on('end', function (){
      var post = querystring.parse(body);
      console.log(post);
      // use post['blah'], etc.
      var _session = request.mySession;
      var content = router.route(post, _session, response);
    });

});

app.get('/quit', function(req, res){
	req.mySession.reset();
	res.redirect('/');
});


app.listen(8887);