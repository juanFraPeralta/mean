var express = require('express');
var app = express();
var path = require('path');
var adminRouter = express.Router();

app.get('/', function(request, response){
	response.sendFile(path.join(__dirname) + '/index.html');
});

//Middleware
adminRouter.use(function(req,res,next){
	console.log('--->', req.method, req.url);
	next();
});

adminRouter.param('name', function(req, res, next, name){
	console.log('req.name: ', req.name);
	console.log('name: ', name);
	req.name="Mr. Robot was here";
	//console.log('req.name 2 : ', req.name);
	next();
});
adminRouter.get('/', function(req, res){
	res.send('Estoy en la pagina principal');
});
adminRouter.get('/users', function(req, res){
	console.log('Ya llegue a la vista de usuarios');
	res.send('Estoy en la pagina users');
});
adminRouter.get('/users/:name', function(req, res){
	res.send('Hola ' + req.name);
});
adminRouter.get('/posts', function(req, res){
	res.send('Estoy en la pagina posts');
});

app.use('/admin', adminRouter);

app.set('port',(process.env.PORT || 5000));
app.listen(app.get('port'));
console.log('Here we go!');
