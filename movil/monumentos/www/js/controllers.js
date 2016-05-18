angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, GoogleMaps) {
  $scope.UpdateMapLocation = function () {
    GoogleMaps.relocalizar();
  }
  
});