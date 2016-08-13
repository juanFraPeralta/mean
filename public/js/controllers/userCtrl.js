angular.module('pokeApp.userCtrl', [])
.controller('userCtrl', function(User) {
    var vm = this;
    vm.message = "Este es el admin de usuario";

    User.all().then(function(response) {
        vm.users = response;
    })

    vm.CreateUser = function(user){
      User.create(user).then(function(response){
        vm.createMessage = response.message;
        console.log(vm.createMessage);
      })
    }
    vm.DeleteUser = function(id){
      User.delete(id).then(function(response){
        vm.deleteMessage = response.message;
        console.log(vm.deleteMessage);
      })
    }
    vm.UpdateUser = function(user){
      User.update(user).then(function(response){
        vm.updateMessage = response.message;
        console.log(vm.updateMessage);
      })
    }
    vm.GetUser = function(id){
      User.get(id).then(function(response){
        vm._id = response._id;
        vm.name = response.name;
        vm.username = response.username;
        vm.getMessage = response;
        console.log(vm.getMessage);
      })
    }


    //
    // User.create(user).then(function(response){
    //   vm.message = response;
    //   console.log("create user: "+ vm.message );
    // })

})
