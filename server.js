var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pokemon');
//mongoose.connect('mongodb://admin:123@ds017553.mlab.com:17553/pokemon_juanfraperalta');
//console.log(mongoose);

//Call the packages
var express = require('express');
var app = express();
var path = require('path');
var adminRouter = express.Router();
var loginRouter = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port = process.env.PORT || 5000;
//

//APP CONFIGURATION
app.use(bodyParser.urlencoder({ extended:true }));
app.use(bodyParser.json());

//CORS
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
});

app.use(morgan())

app.get('/', function(request, response){
	response.sendFile(path.join(__dirname) + '/index.html');
});

///Middleware
adminRouter.use(function(req,res,next){
	console.log('--->', req.method, req.url);
	next();
});
loginRouter.use(function(req,res,next){
	console.log('--->', req.method, req.url);
	next();
});
///
loginRouter.param('user', function(req, res, next, user){
	console.log('user::::: ', user);
	console.log('req.user ', req.user);
req.user ='juan'

	if(req.user == user){
		req.userIsValid = true;
		req.user= user;
		console.log('-??->userIsValid: ', req.userIsValid);

	}else{
		req.userIsValid = false;
		//redirect
	}
	console.log('userIsValid: ', req.userIsValid);
	next();
});
loginRouter.param('password', function(req, res, next, password){
	console.log('password: ', password);
	req.password= password;
	if(req.password =='123'){
		req.passwordIsValid = true;
		req.password= password;
	}else{
		req.passwordIsValid = false;
	}
	console.log(req.passwordIsValid)
	next();
});

//loginRouter.get('/:user', function(req, res){
//	res.send('Hola user ' + req.user);
//});
loginRouter.get('/:user/:password', function(req, res){
	if(req.userIsValid){
		res.send('Hola user: ' + req.user + ' password ' + req.password);
	}else{
		res.send('Usuario Invalido ' + req.user + ' ' + req.password);
	}
});
loginRouter.get('/', function(req, res){
	res.send('Estoy en la pagina login');
});
app.use('/login', loginRouter);

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
