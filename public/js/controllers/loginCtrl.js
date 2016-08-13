angular.module('pokeApp.loginCtrl', [])
    .controller('loginCtrl', function($http, authServices) {
        var vm = this;
        vm.message = "Este es el login";

        vm.login = function(login){
          console.log(login);
          authServices.login(login.username,login.password).then(function(response){
            //vm.createMessage = response.message;
            console.log(response);
          })
        }

        vm.logout = function(){

          authServices.logOut();
        }
    })
