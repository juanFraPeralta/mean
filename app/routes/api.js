var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var User = require('../models/user')
var Pokemon = require('../models/pokemon')
var config = require('../../config');

var superSecret = config.superSecret;

module.exports = function(app, express){

  //Express router instance
  var apiRouter = express.Router();



  apiRouter.post('/authenticate', function(req, res){
    User.findOne({
      username: req.body.username
    })
    .select('name username password')
    .exec(function(err, user){
      if(err) throw err;

      //Username was not found
      if(!user){
        res.json({
          success: false,
          message: 'La autenticación a fallado. El usuario NO existe.'
        });
      } else if(user){
        //Validate if passwords matches
        var validPassword = user.comparePassword(req.body.password);

        if(!validPassword){
          res.json({
            success: false,
            message: 'La autenticación a fallado. Contraseña incorrrecta.'
          });
        } else {
          //If authenticate process is OK then
          //generate a token
          //jwt.sign(payload, secretOrPrivateKey, options, [callback])
          var token = jwt.sign({
            name: user.name,
            username: user.username
          },superSecret,{
            //expiresIn: '24h'
            //expiresIn: '100'
            expiresIn: '1m'
          })

          res.json({
            success: true,
            message: 'Swordfish: Acceso Autorizado',
            token: token
          })
        }
      }
    })
  })


  //Middleware to verify a token
  apiRouter.use(function(req, res, next){
    console.log('¡Alguien ha entrado a la Matrix!');
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token){
      //verify token
      jwt.verify(token, superSecret, function(err, decoded){
        if(err){
          return res.json({
            success: false,
            message: 'Falló la autenticación del token.'
          })
        } else {
          console.log(decoded)
          req.decoded = decoded;
          next();
        }
      })
    } else {
      return res.status(403).send({
        success: false,
        message: 'No se envío el token.'
      })
    }
  })

  //Accesed at GET http://localhost:5000/api
  apiRouter.get('/', function(req, res) {
      res.json({
          message: 'Welcome to Zion! (Our mother API)'
      });
  });



  // Routes /users
  apiRouter.route('/users')
      //Create a user through POST
      //URL: http://localhost:5000/api/users
      .post(function(req, res) {
          var user = new User();
          user.name = req.body.name;
          user.username = req.body.username;
          user.password = req.body.password;

          user.save(function(err) {
              //Verify duplicate entry on username
              if (err) {
                  //console.log(err)
                  if (err.code == 11000) {
                      console.log(err)
                      return res.json({
                          success: false,
                          message: 'El nombre de usuario ya existe.'
                      })
                  }
              }

              res.json({
                  message: 'El usuario se ha creado'
              });

          });

      })
      //Get all users through GET
      //URL: http://localhost:5000/api/users
      .get(function(req, res) {
          User.find(function(err, users) {
              if (err) return res.send(err);

              res.json(users)
          })
      })

  // Routes /users/:user_id
  apiRouter.route('/users/:user_id')
      .get(function(req, res) {
          User.findById(req.params.user_id, function(err, user) {
              if (err) return res.send(err);
              res.json(user);
          })
      })
      .put(function(req, res) {
          User.findById(req.params.user_id, function(err, user) {
              if (err) return res.send(err);

              if (req.body.name) user.name = req.body.name;
              if (req.body.username) user.username = req.body.username;
              if (req.body.password) user.password = req.body.password;

              user.save(function(err) {
                  if (err) return res.send(err);

                  res.json({
                      message: 'Usuario actualizado'
                  })
              })
          })
      })
      .delete(function(req, res) {
          User.remove({
              _id: req.params.user_id
          }, function(err, user) {
              if (err) return res.send(err);
              res.json({
                  message: 'Usuario eliminado'
              })
          })
      })

  //Pokemon API
  // Routes /pokemons
  apiRouter.route('/pokemons')
      //Create a pokemon through POST
      //URL: http://localhost:5000/api/pokemons
      .post(function(req, res) {
          var pokemon = new Pokemon();
          pokemon.name = req.body.name;
          pokemon.type = req.body.type;
          pokemon.owner = req.body.owner;


          pokemon.save(function(err, pokemon) {
              //Verify duplicate entry on pokemonname
              if (err) {
                  //console.log(err)
                  if (err.code == 11000) {
                      return res.json({
                          success: false,
                          message: 'El nombre de usuario ya existe.'
                      })
                  }
              }

              res.json({
                  message: "El pokemon ha sido creado"
              });

          });

      })
      //Get all pokemons through GET
      //URL: http://localhost:5000/api/pokemons
      .get(function(req, res) {
          // Pokemon.find(function(err, pokemons) {
          //     if (err) return res.send(err);
          //
          //     res.json(pokemons)
          // })
          Pokemon.find({}, function(err, pokemons) {
                  User.populate(pokemons, {
                      path: 'owner',
                      select: {
                          name: 1,
                          username: 1
                      },
                      match: {
                          username: 'Cantinflas'
                      },
                  }, function(err, pokemons) {
                      //res.status(200).send(pokemons);
                      res.status(200).json(pokemons);
                  })
              })
              //.skip(4).limit(3)
              //.sort({name: -1})
              .select({
                  name: 1,
                  type: 1,
                  owner: 1
              })
      })

  // Routes /pokemons/:pokemon_id
  apiRouter.route('/pokemons/:pokemon_id')
      .get(function(req, res) {
          Pokemon.findById(req.params.pokemon_id, function(err, pokemon) {
              if (err) return res.send(err);
              res.json({
                  message: pokemon.sayHi(),
                  count: 'Ha sido consultado ' + pokemon.count + ' veces'
              });
          })
      })
      .put(function(req, res) {
          Pokemon.findById(req.params.pokemon_id, function(err, pokemon) {
              if (err) return res.send(err);

              if (req.body.name) pokemon.name = req.body.name;
              if (req.body.type) pokemon.type = req.body.type;
              if (req.body.owner) pokemon.owner = req.body.owner;

              pokemon.save(function(err) {
                  if (err) return res.send(err);

                  res.json({
                      message: 'Pokemon actualizado'
                  })
              })
          })
      })
      .delete(function(req, res) {
          Pokemon.remove({
              _id: req.params.pokemon_id
          }, function(err, pokemon) {
              if (err) return res.send(err);
              res.json({
                  message: 'Pokemon eliminado'
              })
          })
      })

  apiRouter.route('/pokemons/type/:type')
      .get(function(req, res) {
          Pokemon.find({
              //type: /Electric/i
              //type: req.params.type
              //type: new RegExp(req.params.type, 'i'),
              //name: /chu/i
              $or: [{
                  type: /Electric/i
              }, {
                  type: /Psychic/i
              }],
              // count: {
              //   $gt: 0,
              //   $lt: 10
              // }
              count: {
                  $in: [1, 0]
              }
          }, function(err, pokemons) {
              res.json(pokemons)
          })
      })

      return apiRouter;

}
