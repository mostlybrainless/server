var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');

function route(post, response) {

  var url = 'mongodb://localhost:27017/test';
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  var entry = {};
  entry["login"]=post["login"];
  db.collection('users').find(entry).toArray( 
  	function(err, docs){
   	assert.equal(err, null);
   	console.log(docs);


  if (post['type_in'] === 'signin') {
    if(docs.length > 0){
    	if(post["psw"] === docs[0]["psw"]){
    		db.close();
    		response.writeHead(200, {"Content-Type": "text/plain"});
    		response.write("You are in!");
    		response.end();
    	} else {
    		db.close();
    		response.writeHead(403, {"Content-Type": "text/plain"});
    		response.write("You are not allowed. Your login or password is incorrect");
    		response.end();
    	}
    } else {
    	db.close();
    	response.writeHead(403, {"Content-Type": "text/plain"});
    	response.write("You are not allowed. Your login or password is incorrect");
    	response.end();
    }
  } else if(post["type_in"] === 'login') {
  		if(docs.length > 0){
  			db.close();
  			response.writeHead(403, {"Content-Type": "text/plain"});
    		response.write("Sorry. This password is already taken");
    		response.end();
  		} else {
  			var entry = {};
			entry["login"]=post["login"];
			entry["psw"]=post["psw"];
			db.collection('restaurants').insert(entry, 
  				function(err, result){
   				assert.equal(err, null);
   				console.log(result.result['ok']);
   				db.close();
   				fs.readFile("index2.html", function(error, file){
   					if(error){
   					response.writeHead(500, {"Content-Type": "text/plain"});
    				response.write(error);
    				response.end();	
   					}else{
   					response.writeHead(302, {"Content-Type": "text/html"});
    				response.write(file);
    				response.end();
    				}


    			});
 			});
  		};
  };



   });
});
}

exports.route = route;