angular.module('pokeApp.authServices', [])
    .service('authServices', function($http, $q, AuthToken, $location) {
      this.login = function(username, password){
        return $http.post('/api/authenticate', {
          username: username,
          password: password
        }).success(function(data){
          AuthToken.setToken(data.token);
          return data;
        })


      }

      this.logOut = function(){
        console.log('log out from service');
        AuthToken.setToken();
      }

      this.isLoggedIn = function(){
        if(AuthToken.getToken()){
          return true;
        }else {
          return false;
        }
      }

      // this.getUser() = function(){
      //   if(AuthToken.getToken()){
      //     return $http.get('/api/me', {
      //       cache: true
      //     });
      //   }else {
      //     return $q.reject({
      //       message: 'User has no token'
      //     });
      //   }
      // }

    })

    .service('AuthToken',function($window){///local storage - cookie
      this.getToken = function(){
        return $window.localStorage.getItem('token');
      }
      this.setToken = function(token){
        if(token){
          $window.localStorage.setItem('token', token);
        }else{
          $window.localStorage.removeItem('token');
        }
      }
    })

    .service('AuthInterceptor', function($q, $location, AuthToken){
      this.request = function(config){
        var token = AuthToken.getToken();
        if(token){
          config.headers['x-access-token'] = token;
        }
        return config;
      }

      this.responseError = function(response){
        if(response.status == 403){
          AuthToken.setToken();
          $location.path('/login');
        }
        return $q.reject(response);

      }
    //  return $q.reject(response);

    })
