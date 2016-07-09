var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(request, response){
	response.sendFile(path.join(__dirname) + '/index.html');
});
app.listen(1337);
console.log('Here we go!');

