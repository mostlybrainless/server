var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

function login(post, response) {
  console.log("Request handler 'login' was called.");
}

function signin(post, response) {

  console.log("Request handler 'signin' was called.");

  var url = 'mongodb://localhost:27017/test';
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  var entry = {};
  entry["login"]=login;
  db.collection('restaurants').find(entry).toArray( 
  	function(err, docs){
   	assert.equal(err, null);
   	console.log(docs);
   	if(docs.length > 0){
   		docs[0].
   	} else {
   		
   	}
   	db.close();
   });
});

}

exports.login = login;
exports.signin = signin;