var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var session = require('client-sessions');


function route(post, session, response) {
  console.log(session.user);

  var url = 'mongodb://s27501.vdi.mipt.ru:27017/test';
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  var entry = {};
  entry["login"]=post["login"];
  db.collection('restaurants').find(entry).toArray( 
  	function(err, docs){
   	assert.equal(err, null);
   	console.log(docs);


  if (post['type_in'] === 'signin') {
    if(docs.length > 0){
    	if(post["psw"] === docs[0]["psw"]){
    		db.close();
        session.user = docs[0]["login"];
    		response.writeHead(200, {"Content-Type": "text/html"});
    		response.write("<html><head></head><body>Your login is " + docs[0]["login"] + ". And your password is "
          + docs[0]["psw"] + ". Hello!<br><form action=\"http:\/\/w27501.vdi.mipt.ru\/quit\" method=\"get\"><input type=\"submit\" value=\"Logout\"></form></body></html>");
    		response.end();
    	} else {
    		db.close();
    		response.writeHead(403, {"Content-Type": "text/html"});
    		response.write("<html><head><title>Some fancy website</title></head><body>You are not allowed. Your login or password is incorrect<form action=\"http://w27501.vdi.mipt.ru\" method=\"post\">Login:<br><input type=\"text\" name=\"login\"><br>Password:<br><input type=\"password\" name=\"psw\"><br><input type=\"radio\" name=\"type_in\" value=\"signin\">Sign-in<br><input type=\"radio\" name=\"type_in\" value=\"login\">Log-in<br><input type=\"submit\" value=\"Signin\"></form><br><a href=\"http://w27501.vdi.mipt.ru/twitter\">Sign in with Twitter</a></body></html>");
    		response.end();
    	}
    } else {
    	db.close();
    	response.writeHead(403, {"Content-Type": "text/html"});
    	response.write("<html><head> <title>Some fancy website</title></head><body>You are not allowed. Your login or password is incorrect<form action=\"http://w27501.vdi.mipt.ru\" method=\"post\">Login:<br><input type=\"text\" name=\"login\"><br>Password:<br><input type=\"password\" name=\"psw\"><br><input type=\"radio\" name=\"type_in\" value=\"signin\">Sign-in<br><input type=\"radio\" name=\"type_in\" value=\"login\">Log-in<br><input type=\"submit\" value=\"Signin\"></form><br><a href=\"http://w27501.vdi.mipt.ru/twitter\">Sign in with Twitter</a></body></html>");
    	response.end();
    }
  } else if(post["type_in"] === 'login') {
  		if(docs.length > 0){
  			db.close();
  			response.writeHead(403, {"Content-Type": "text/html"});
    		response.write("<html><head> <title>Some fancy website</title></head><body>Sorry. This login (" + docs[0]["login"] +  ") is already taken <form action=\"http://w27501.vdi.mipt.ru\" method=\"post\">Login:<br><input type=\"text\" name=\"login\"><br>Password:<br><input type=\"password\" name=\"psw\"><br><input type=\"radio\" name=\"type_in\" value=\"signin\">Sign-in<br><input type=\"radio\" name=\"type_in\" value=\"login\">Log-in<br><input type=\"submit\" value=\"Signin\"></form><br><a href=\"http://w27501.vdi.mipt.ru/twitter\">Sign in with Twitter</a></body></html>");
    		response.end();
  		} else {
  			var entry = {};
			entry["login"]=post["login"];
			entry["psw"]=post["psw"];
			db.collection('restaurants').insert(entry, 
  				function(err, result){
   				assert.equal(err, null);
   				db.close();
          session.user = post["login"];
            response.writeHead(302, {"Content-Type": "text/html"});
    				response.write("<html><head></head><body>Your login is " + post["login"] + ". And your password is "
          + post["psw"] + ". Welcome!<br><form action=\"http:\/\/w27501.vdi.mipt.ru\/quit\" method=\"get\"><input type=\"submit\" value=\"Logout\"></form></body></html>");
    				response.end();


    			
 			});
  		};
  };



   });
});
}

exports.route = route;