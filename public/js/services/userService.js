angular.module('pokeApp.userServices', [])
    .service('User', function($http, $q) {
        var _users = undefined;
        var _user = undefined;

        this.all = function(){
          if (!_users) {
              var deferred = $q.defer();

              $http.get("/api/users/")
                  .success(function(response) {
                      deferred.resolve(response);
                  })
                  .error(function(response) {
                      deferred.reject(response);
                  });
              _users = deferred.promise
          }
          return _users;
        }

        this.get = function(user_id){
          var deferred = $q.defer();
          $http.get("/api/users/" + user_id)
            .success(function(response) {
              deferred.resolve(response);
            })
            .error(function(response) {
              deferred.reject(response);
            });
          console.log("user get from service");
          return deferred.promise;
        }
        this.create = function(user){
          var deferred = $q.defer();
          $http.post("/api/users/", user)
            .success(function(response) {
              deferred.resolve(response);
            })
            .error(function(response) {
              deferred.reject(response);
            });
          console.log("user created from service");
          return deferred.promise;
        }

        this.update = function(user){
          var deferred = $q.defer();
          $http.put("/api/users/" + user._id, user)
            .success(function(response) {
              deferred.resolve(response);
            })
            .error(function(response) {
              deferred.reject(response);
            });
          console.log("user updated from service");
          return deferred.promise;
        }

        this.delete = function(user_id){
          var deferred = $q.defer();
          $http.delete("/api/users/" + user_id)
            .success(function(response) {
              deferred.resolve(response);
            })
            .error(function(response) {
              deferred.reject(response);
            });
          console.log("user deleted from service");
          return deferred.promise;
        }
    })
