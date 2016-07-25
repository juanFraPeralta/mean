//Call the packages
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var path = require('path');
// var adminRouter = express.Router();
// var loginRouter = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var morgan = require('morgan');
var User =  require('./models/user');
var Pokemon =  require('./models/pokemon');

var superSecret = 'strangeThings';
var port = process.env.PORT || 5000;

//APP CONFIGURATION
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

//CORS
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-Width, content-type, Authorization');
	next();
});

//loggin all request to the console
app.use(morgan('dev'));

//DB connections
//mongoose.connect('mongodb://localhost/pokemon');
mongoose.connect('mongodb://admin:123@ds017553.mlab.com:17553/pokemon_juanfraperalta');
//console.log(mongoose);

//API ROUTES
//Main/basic route
app.get('/', function(req, res){
	res.send('Welcome ot the real world!')
});

//Express router instance
var apiRouter = express.Router();

//Accesed at GET http://localhost:5000/api
// apiRouter.get('/', function(req, res){
// 	res.json({ message:'Stop to try hit me and hit me!' });
// });

apiRouter.post('/authenticate', function(req, res){
	User.findOne({
		username : req.body.username
	})
	.select('name username password')
	.exec(function(err, user){
		if(err) throw err;

		//Username was not found
		if(!user){
			res.json({
				success: false,
				message: 'La autenticacion ha fallado. El usuario NO existe'
			});
		}else if(user){
			//Validate if password matches
			var validPassword = user.comparePassword(req.body.password);
			if(!validPassword){
				res.json({
					success: false,
					message: 'La autenticacion ha fallado. Contrasenia incorrecta'
				});
			}else {
				//If authenticate process is OK then
				//generate a token
				var token = jwt.sign({
					name: user.name,
					username: user.username,
				}, superSecret, {
					expiresIn: '24h'
				})
				res.json({
					success: true,
					message: 'Acceso Authorization',
					token: token
				});
			}
		}
	});
});

//Middleware to verify a token
apiRouter.use(function(req, res, next){
	console.log('Middleware to verify a token');
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		//verify token
		jwt.verify(token, superSecret, function(err, decoded){
			if(err){
				return res.json({
					success: false,
					message: 'Fallo la autenticacion del token'
				})
			}else{
				console.log(decoded);
				req.decoded = decoded;
				next();
			}
		})
	}else {
		return res.status(403).send({
			success: false,
			message: 'no puedes entrar bitch: 403'
		});

	}
//	next();
});

apiRouter.get('/', function(req, res){
	res.json({
		message: 'Welcome'
	});
});

apiRouter.get('/me', function(req, res){

	res.json({
		message: 'Welcome ' + req.decoded.name
	});


});


//Routes /users
apiRouter.route('/users')
//create a user througth POST
//URL: http://localhost:5000/api/users
.post(function(req, res){
	var user = new User();
	user.name = req.body.name;
	user.username = req.body.username;
	user.password = req.body.password;
	user.save(function(err){

		if(err){
			//verify duplicate entry on username
			if(err.code == 11000){
				console.log(err);
				return res.json({ success: false, message: 'El nombre es duplicado'});
			}
		}
		res.json({ message: 'El usuario se ha creado'});
	});
})
//get all users througth GET
//URL: http://localhost:5000/api/users
.get(function(req, res){
	User.find(function(err, users){
		if(err) return res.send(err);
		res.json(users);
	});
})
;

// apiRouter.get('/', function(req, res){
// 	res.json({ message:'Stop to try hit me and hit me!' });
// });

apiRouter.route('/users/:user_id')
.get(function(req, res){
	User.findById(req.params.user_id, function(err, user){
		if(err) return res.send(err);
		res.json(user);
	});
})
.put(function(req, res){
	User.findById(req.params.user_id, function(err, user){
		if(err) return res.send(err);
			if(req.body.name) user.name = req.body.name;
			if(req.body.username) user.username = req.body.username;
			if(req.body.password) user.password = req.body.password;

			user.save(function(err){
				if(err) return res.send(err);
				res.json({message:'Usuario Actualizado'})
			});
	});
})
.delete(function(req, res){
	User.remove({
		_id:req.params.user_id
	}, function(err,user){
		if(err) return res.send(err);
		res.json({message:'Usuario eliminado'})
	});
})

apiRouter.route('/users/name/:name')
.get(function(req, res){
	User.findOne(req.params.name, function(err, user){
		if(err) return res.send(err);
		res.json(user);
	});
})

//Routes /pokemons
apiRouter.route('/pokemons')
//create a pokemon througth POST
//URL: http://localhost:5000/api/pokemons
.post(function(req, res){
	var pokemon = new Pokemon();
	pokemon.type = req.body.type;
	pokemon.name = req.body.name;
	pokemon.owner = req.body.owner;
	pokemon.save(function(err){
		if(err){
			//verify duplicate entry on pokemonname
			if(err.code == 11000){
				console.log(err);
				return res.json({ success: false, message: 'El nombre es duplicado'});
			}
		}
		res.json({ message: 'El pokemon se ha creado'});
	});
})
//get all pokemons througth GET
//URL: http://localhost:5000/api/pokemons
.get(function(req, res){
	// Pokemon.find(function(err, pokemons){
	// 	if(err) return res.send(err);
	// 	res.json(pokemons);
	// });
	Pokemon.find({}, function(err, pokemons){
		User.populate(pokemons, {
			path: 'owner',
			select: {name:1}, //, username:1
			match: {name: 'juan'}
		}, function(err, pokemons){
			res.status(200).send(pokemons);

		})
	})//.skip(2).limit(1)
	//.sort({name: -1})
	.select({name:1, type:1, owner:1})
});

apiRouter.route('/pokemons/:pokemon_id')
.get(function(req, res){
	Pokemon.findById(req.params.pokemon_id, function(err, pokemon){
		if(err) return res.send(err);
		// Pokemon.save(function(err){
		// 	if(err) return res.send(err);
		// 	res.json({message:'Pokemon Actualizado Count'});
		// });
		res.json(pokemon);
	});
})
.put(function(req, res){
	Pokemon.findById(req.params.pokemon_id, function(err, pokemon){
		if(err) return res.send(err);
			if(req.body.name) pokemon.name = req.body.name;
			if(req.body.type) pokemon.type = req.body.type;
			if(req.body.owner) pokemon.owner = req.body.owner;
			pokemon.save(function(err){
				if(err) return res.send(err);
				res.json({message:'Pokemon Actualizado'})
			});
	});
})
.delete(function(req, res){
	Pokemon.remove({
		_id:req.params.pokemon_id
	}, function(err,pokemon){
		if(err) return res.send(err);
		res.json({message:'Pokemon eliminado'})
	});
})

apiRouter.route('/pokemons/name/:name')
.get(function(req, res){
	Pokemon.findOne(req.params.name, function(err, pokemon){
		if(err) return res.send(err);
		res.json(pokemon.sayHi());
	});
})

apiRouter.route('/pokemons/type/:type')
.get(function(req, res){
	Pokemon.find({
		type: new RegExp(req.params.type, 'i'),
		//name: /ju/i,
		// count: {
		// 	$gt:0,
		// 	$lt:2
		// }
		// name:{
		// 	$in: ['pika']
		// }
	}, function(err, pokemons){
		res.json(pokemons);
	});

})

//Register our routes
app.use('/api', apiRouter);
app.listen(port);

//
// app.get('/', function(request, response){
// 	response.sendFile(path.join(__dirname) + '/index.html');
// });
//
// ///Middleware
// adminRouter.use(function(req,res,next){
// 	console.log('--->', req.method, req.url);
// 	next();
// });
// loginRouter.use(function(req,res,next){
// 	console.log('--->', req.method, req.url);
// 	next();
// });
// ///
// loginRouter.param('user', function(req, res, next, user){
// 	console.log('user::::: ', user);
// 	console.log('req.user ', req.user);
// req.user ='juan'
//
// 	if(req.user == user){
// 		req.userIsValid = true;
// 		req.user= user;
// 		console.log('-??->userIsValid: ', req.userIsValid);
//
// 	}else{
// 		req.userIsValid = false;
// 		//redirect
// 	}
// 	console.log('userIsValid: ', req.userIsValid);
// 	next();
// });
// loginRouter.param('password', function(req, res, next, password){
// 	console.log('password: ', password);
// 	req.password= password;
// 	if(req.password =='123'){
// 		req.passwordIsValid = true;
// 		req.password= password;
// 	}else{
// 		req.passwordIsValid = false;
// 	}
// 	console.log(req.passwordIsValid)
// 	next();
// });
//
// //loginRouter.get('/:user', function(req, res){
// //	res.send('Hola user ' + req.user);
// //});
// loginRouter.get('/:user/:password', function(req, res){
// 	if(req.userIsValid){
// 		res.send('Hola user: ' + req.user + ' password ' + req.password);
// 	}else{
// 		res.send('Usuario Invalido ' + req.user + ' ' + req.password);
// 	}
// });
// loginRouter.get('/', function(req, res){
// 	res.send('Estoy en la pagina login');
// });
// app.use('/login', loginRouter);
//
// adminRouter.param('name', function(req, res, next, name){
// 	console.log('req.name: ', req.name);
// 	console.log('name: ', name);
// 	req.name="Mr. Robot was here";
// 	//console.log('req.name 2 : ', req.name);
// 	next();
// });
// adminRouter.get('/', function(req, res){
// 	res.send('Estoy en la pagina principal');
// });
// adminRouter.get('/users', function(req, res){
// 	console.log('Ya llegue a la vista de usuarios');
// 	res.send('Estoy en la pagina users');
// });
// adminRouter.get('/users/:name', function(req, res){
// 	res.send('Hola ' + req.name);
// });
// adminRouter.get('/posts', function(req, res){
// 	res.send('Estoy en la pagina posts');
// });
//
// app.use('/admin', adminRouter);
//
// app.set('port',(process.env.PORT || 5000));
// app.listen(app.get('port'));
console.log('Here we go!' + port);
