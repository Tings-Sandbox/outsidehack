// Uber API Constants
var uberClientId = "22M8PImdH2hTLB2PIE94iSi2EFHSwaTZ"
  , uberServerToken = "r60oqbz9eu9EBnF-sKZK9ho5bidz3MGJLnWbDUOI"
  , facebooAppId = "845128085562763";
var alertPopup;
angular.module('starter.controllers', ['ionic-timepicker','facebookUtils'])

.config(function($stateProvider, $urlRouterProvider) {
  //$urlRouterProvider.otherwise('/')

  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'templates/home.html'
  })

  $stateProvider.state('location', {
    url: '/location',
    templateUrl: 'location.html'
  })
})

.constant('facebookConfigSettings', {
    'appID' : facebooAppId
  })

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http, $ionicPopup) {
  $scope.selectedFriends = [];
  $scope.timeDiff = 5;

  // An alert dialog
   $scope.fbLogin = function() {
    alertPopup = $ionicPopup.alert({
       title: 'Login',
       okText: '',
       okType: 'button-light',
       template: '<facebook-login-button></facebook-login-button>'
     });
     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };
  $scope.mapCreated = function(map) {
    $scope.map = map;
  };

  $scope.friends = ['Shivang', 'Shashank', 'Ting', 'Gil', 'Adam', 'Chris'];

  $scope.addThisFriend = function(name){
    $scope.selectedFriends.push(name);
  }

  $scope.getUber = function (){
    var latitude = window.localStorage['lat'];
    var longitude = window.localStorage['long'];
    var timeDiff = $scope.timeDiff;
    var req = {
         method: 'GET',
         url: 'https://sandbox-api.uber.com/v1/products',
         headers: {
           Authorization: "Token "+uberServerToken,
           Accept: 'application/json'
         },
         data: {
            latitude: latitude,
            longitude: longitude,
         }
        }

    $http(req).success(function(estimates){
              console.log(estimates);
                // for each (estimate in estimates){

                // }
              }).error(function(err){
                console.log(err);
              });
  }

  //time picker

  var currentTime = Math.floor(Date.now() / 1000) - 25200;
  $scope.slots = {epochTime: currentTime, format: 12, step: 15};
  console.log(currentTime);
  $scope.timePickerCallback = function (val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      console.log('Selected time is : ', val);    // `val` will contain the selected time in epoch
      
    }
  };

  $scope.centerOnMe = function () {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      var markerPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      $scope.map.setCenter(markerPosition);
      var map = $scope.map;
      var marker = new google.maps.Marker({
          position: markerPosition,
          map: map,
          title: 'You are here!'
      });
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  $rootScope.$on('fbLoginSuccess', function(name, response) {
    if(response.status == "connected"){
      $rootScope.loggedInUser = response;
      alertPopup.close();
    }
  });

  $rootScope.$on('fbLogoutSuccess', function() {
    $scope.$apply(function() {
      $rootScope.loggedInUser = {};
    });
  });
});

