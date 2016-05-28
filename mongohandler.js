var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

function insertUser(login, psw){
var url = 'mongodb://localhost:27017/test';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  var entry = {};
  entry["login"]=login;
  entry["psw"]=psw;
  db.collection('restaurants').insert(entry, 
  	function(err, result){
   	assert.equal(err, null);
   	console.log(result.result['ok']);
   	db.close();
   });
});
};

function findUser(login, psw){
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
   		console.log("bad");
   	} else {
   		console.log("good");

   	}
   	db.close();
   });
});
};
findUser("simka", "dupka");

exports.insertUser = insertUser;