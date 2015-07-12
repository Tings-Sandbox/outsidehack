angular.module('starter.directives', [])
.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {

        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
  
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });

        google.maps.event.addListener(map, 'click', function(event) {
           if(window.location.hash != '#/location' )
            placeMarker(map, event.latLng);
        });

        navigator.geolocation.getCurrentPosition(function (pos) {
          console.log('Got pos', pos);
          var markerPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
          map.setCenter(markerPosition);
          window.localStorage['lat'] = pos.coords.latitude;
          window.localStorage['long'] = pos.coords.longitude;
          if(window.location.hash != '#/location' ){
            var marker = new google.maps.Marker({
                position: markerPosition,
                map: map,
                title: 'You are here!'
            });
          }
        }, function (error) {
          alert('Unable to get location: ' + error.message);
        });

      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
})

.directive('standardTimeMeridian', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      etime: '=etime'
    },
    template: "<strong>{{stime}}</strong>",
    link: function(scope, elem, attrs) {

      scope.stime = epochParser(scope.etime, 'time');

      function prependZero(param) {
        if (String(param).length < 2) {
          return "0" + String(param);
        }
        return param;
      }

      function epochParser(val, opType) {
        if (val === null) {
          return "00:00";
        } else {
          var meridian = ['AM', 'PM'];

          if (opType === 'time') {
            var hours = parseInt(val / 3600);
            var minutes = (val / 60) % 60;
            var hoursRes = hours > 12 ? (hours - 12) : hours;
            console.log('in dir',hoursRes);
            var currentMeridian = meridian[parseInt(hours / 12)];
            if(hoursRes)
              return (prependZero(hoursRes) + ":" + prependZero(minutes) + " " + currentMeridian);
            else
              return 'Set Pickup time';
          }
        }
      }

      scope.$watch('etime', function(newValue, oldValue) {
        scope.stime = epochParser(scope.etime, 'time');
      });

    }
  };
})


function placeMarker(map, location) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map,
    });
}