//call the packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

//User Schema
var UserSchema = new Schema({
  name: String,
  username: {
    type: String,
    required: true,
    index:{
      unique: true
    }
  },
  password: {
    type: String,
    required: true,
    select: false //para que no traiga la propiedad en el request
  }

});

UserSchema.pre('save', function(next){
  var user = this;
  //If the password dont change then continue
  if(!user.isModified('password')) return next();

  //Generate the hash
  bcrypt.hash(user.password, null, null, function(err, hash){
    if(err) return next(err);

    //change the password to the hashed version
    user.password = hash;
    next();
  });

});

//definiendo un metodo y agregandolo al schema
UserSchema.methods.comparePassword = function(password){
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
