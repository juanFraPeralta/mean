//call the packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Pokemon Schema
var PokemonSchema = new Schema({
  type: String,
  name: {
    type: String,
    required: true,
    index:{
      unique: true
    }
  },
  count: {
    type: Number,
    default: 0
  },
  owner:{
    type: Schema.ObjectId,
    ref: 'User'
  }

});

PokemonSchema.methods.sayHi = function(){
  var pokemon = this;
  return 'Hola!, soy un' + pokemon.name + ' de tipo ' + pokemon.type;
}
PokemonSchema.post('findOne', function(pokemon){
  console.log(pokemon.count);
  pokemon.count ++;
  pokemon.save();
  console.log(pokemon.count);

})

// PokemonSchema.pre('save', function(req, res, next){
//   res.count = req.count + 1;
//   return next();
//
// });

module.exports = mongoose.model('Pokemon', PokemonSchema);
