angular.module('pokeApp.mainCtrl', [])
    .controller('mainCtrl', function($location, authServices, $rootScope){
        var vm = this;
        vm.loggedIn = authServices.isLoggedIn();

        $rootScope.$on('$routeChangeStart', function(){
          vm.loggedIn = authServices.isLoggedIn();
        });
        vm.goTo = function(route) {
            $location.path(route)
          }
    })
