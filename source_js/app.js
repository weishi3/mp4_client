var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services','mp4alertTag','720kb.datepicker']);


app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsController'
      })
      .when('/users', {
        templateUrl: 'partials/userList.html',
        controller: 'UserListController'
      })
      .when('/user/:user_id', {
        templateUrl: 'partials/userDetail.html',
        controller: 'UserDetailsController'
      })
      .when('/users/new', {
        templateUrl: 'partials/userAdd.html',
        controller: 'UserAddController'
      })
      .when('/tasks', {
        templateUrl: 'partials/taskList.html',
        controller: 'TaskListController'
      })
      .when('/task/:task_id', {
        templateUrl: 'partials/taskDetail.html',
        controller: 'TaskDetailsController'
      })
      .when('/tasks/new', {
        templateUrl: 'partials/addTask.html',
        controller: 'TaskAddController'
      })
      .when('/task/:task_id/edit', {
        templateUrl: 'partials/taskEdit.html',
        controller: 'TaskEditController'
      })
      .otherwise({
        redirectTo: '/settings'
      });
}]);