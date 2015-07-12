angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives'])

.controller('LocationCtrl', function($rootScope, $scope, $ionicLoading, $http, $ionicPopup) {

	// Triggered on a button click, or some other target
	$scope.askLocationPerm = function() {
		$scope.data = {}

		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: '<input type="text" ng-model="data.name">',
			title: 'Start Navigating with Friends!',
			scope: $scope,
			buttons: [
				{
					text: '<b>Save</b>',
					type: 'button-positive',
					onTap: function(e) {
					if (!$scope.data.name) {
						//don't allow the user to close unless he enters wifi password
						e.preventDefault();
					} else {
						publish($scope.data.name);
						myPopup.close();
					}
					}
				},
			]
		});
		myPopup.then(function(res) {
			console.log('Tapped!', res);
			$scope.centerOnMe();
		});
	};

	$scope.mapLCreated = function(map) {
		$scope.map = map;
		console.log("Map created Location");
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
				var markerPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
				$scope.map.setCenter(markerPosition);
				var map = $scope.map;
				var marker = new google.maps.Marker({
					position: markerPosition,
					map: map,
					title: 'You are here!'
				});

				// Open info
				google.maps.event.addListener("marker", 'click', function() {
				   infowindow('You are here!',map,marker);
				});

				setInterval(function(){
					console.log('Before Find me');
					findMe(marker);
				},8000);
				$scope.loading.hide();
			}, function (error) {
				alert('Unable to get location: ' + error.message);
			});
	};

	function findMe(initialMarkerPosition){
		console.log('Find Me');
		navigator.geolocation.getCurrentPosition(function (pos) {
			initialMarkerPosition.setPosition(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			//$scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			window.localStorage['lat'] = pos.coords.latitude;
			window.localStorage['long'] = pos.coords.longitude;
		}, function (error) {
			console.log('Unable to get location: ' + error.message);
		});
	};

	function infowindow(markerName, map, marker){
		new google.maps.InfoWindow({
			content: markerName
		}).open(map,marker);
	}
	function publish(name) {
		console.log(name);
		var friendMarkers = {};
		pubnub = PUBNUB({                          
			publish_key   : 'pub-c-85482eef-f532-47ef-9f80-123104d3b9f1',
			subscribe_key : 'sub-c-b28ad0d4-288b-11e5-83e8-02ee2ddab7fe',
			ssl : (('https:' == document.location.protocol) ? true : false)
		})

		console.log("Subscribing..");
		pubnub.subscribe({                                     
			channel : "location",
			message : function(message,env,ch,timer,magic_ch){
				if ($scope.data.name == message.data.name)	
					return;
				console.log('Received msg: ' + message.data.name, message);
				var map = $scope.map;
				if(friendMarkers[message.data.name] == undefined){
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(message.data.latitude, message.data.longitude),
						map: map,
						title: message.data.name
					});
					var temp = {
						data : message.data,
						marker : marker,
					};
					friendMarkers[message.data.name] = temp;
				}else{
					friendMarkers[message.data.name].marker.setPosition(new google.maps.LatLng(message.data.latitude, message.data.longitude));
					friendMarkers[message.data.name].data = message.data;
				}
				// Open info
				map.event.addListener("marker", 'click', function() {
				   infowindow(message.data.name,map,marker);
				});
			},
			connect: pub
		})

		function pub() {
			console.log("Publishing location");
			pubnub.publish({                                    
				channel : "location",
				message : {
					data : {
						latitude  : window.localStorage['lat'],  
						longitude : window.localStorage['long'],
						name		: name
					}
				},
				callback: function(m){ console.log(m) }
			})
		}

		setInterval(function(){
			console.log('Pub');
			pub();
		},8000);
	}
});