var mp4alertTag = angular.module('mp4alertTag', []);


mp4alertTag.directive('alert', function() {
    return {
        restrict: 'E',
        scope: {},
        replace: true,
        controller: function($scope, Alert) {
            $scope.showAlert = false;
            $scope.alert = Alert;

            $scope.$watchCollection('alert.messages', function() {
                $scope.showAlert = $scope.alert.messages.length > 0;
            });

            $scope.hideAlert = function(index) {
                $scope.alert.remove(index);
            };
        },
        templateUrl: 'partials/alert.html'
    };
});


