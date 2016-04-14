var mp4Controllers = angular.module('mp4Controllers', []);


mp4Controllers.controller('SettingsController', [
  '$scope',
  '$window',
  'Alert',
  function($scope, $window, Alert) {
    $scope.url = $window.sessionStorage.baseUrl;
    $scope.showAlerts = Alert.showAlerts;

    $scope.$watch('showAlerts', function(oldVal, newVal) {
      Alert.showAlerts = $scope.showAlerts;
    });

    $scope.setUrl = function() {
      $window.sessionStorage.baseUrl = $scope.url;
      $scope.displaySave = "URL Saved!";
    };
  }
]);

mp4Controllers.controller('UserListController', [
  '$scope',
  '$http',
  '$q',
  '$window',
  'Users',
  'Tasks',
  'Alert',
  function($scope, $http, $q, $window, Users, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      function getUserInfos() {
        Users.get({
          select: {
            _id: 1,
            name: 1
          }
        }).success(function(data) {
          Alert.alert('success', data.message);
          $scope.users = data.data;
        }).error(Alert.error);
      }
      getUserInfos();

      $scope.deleteUser = function(id) {
        Users.delete(id).success(function(data) {
          Alert.alert('success', data.message);

          Tasks.get({
            where: {
              assignedUser: id,
              completed: false
            }
          }).success(function(data) {
            Alert.alert('success', data.message);

            var updates = [];
            var numSuccess = 0;
            var numError = 0;
            var incompleteTasks = data.data;
            angular.forEach(incompleteTasks, function(task) {
              var unassignedTask = task;
              unassignedTask.assignedUser = '';
              unassignedTask.assignedUserName = 'unassigned';

              var update = Tasks.update(
                  unassignedTask._id,
                  unassignedTask
              ).success(function(data) {
                    numSuccess++;
                  }).error(function(data) {
                    numError++;
                  });

              updates.push(update);
            });

            $q.all(updates).then(function(data) {
              if (numSuccess > 0)
                Alert.alert('success', 'Successfully update ' + numSuccess + ' tasks.');
              getUserInfos();
            }, function(data) {
              if (numSuccess > 0)
                Alert.alert('success', 'Successfully update ' + numSuccess + ' tasks.');
              if (numError > 0)
                Alert.alert('alert', 'Failed to update ' + numError + ' tasks.');
              Alert.alert('alert', 'Failed to update all pendingTasks.');
            });
          }).error(Alert.error);
        }).error(Alert.error);
      };
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('TaskListController', [
  '$scope',
  '$http',
  '$window',
  'Users',
  'Tasks',
  'Alert',
  function($scope, $http, $window, Users, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      $scope.currentPage = 0;
      $scope.perPage = 10;
      $scope.whereFilters = [
        { label: 'Pending'  , value: { completed: false, assignedUserName: { $ne: 'unassigned' } } },
        { label: 'Completed', value: { completed: true } },
        { label: 'All'      , value: {} },
        { label: 'Unassigned', value: {assignedUserName: 'unassigned'} }
      ];
      $scope.sort = 1;
      $scope.sortElements = [
        { label: 'taskName'  , value: { name: $scope.sort} },
        { label: 'assignedUserName'  , value: { assignedUserName: $scope.sort} },
        { label: 'dateCreated'  , value: { dateCreated: $scope.sort} },
        { label: 'deadline'  , value: { deadline: $scope.sort} }


      ];
      $scope.sortElement= $scope.sortElements[0];
      $scope.filter = $scope.whereFilters[0];


      $scope.$watch('filter', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.currentPage = 0;
          getTasks();
        }
      });

      $scope.$watch('sort', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.currentPage = 0;
          getTasks();
        }
      });

      $scope.$watch('sortElement', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.currentPage = 0;
          getTasks();
        }
      });



      function getTasks() {
        Tasks.get({
          where: $scope.filter.value,
          count: true
        }).success(function(data) {
          $scope.maxPage = Math.ceil(data.data / $scope.perPage);

          Tasks.get({
            where: $scope.filter.value,
            select: {
              _id: 1,
              name: 1,
              completed: 1,
              assignedUser: 1,
              assignedUserName: 1,
              dateCreated: 1,
              deadline: 1
            },
            sort: $scope.sortElement.value,
            skip: $scope.perPage * $scope.currentPage,
            limit: $scope.perPage
          }).success(function(data) {
            Alert.alert('success', data.message);
            $scope.tasks = data.data;
          }).error(Alert.error);
        }).error(Alert.error);
      }
      getTasks();

      $scope.nextPage = function() {
        $scope.currentPage = ($scope.currentPage + 1) % $scope.maxPage;
        getTasks();
      };

      $scope.prevPage = function() {
        $scope.currentPage = ($scope.currentPage + $scope.maxPage - 1) % $scope.maxPage;
        getTasks();
      };

      $scope.deleteTask = function(id, userId) {
        Tasks.delete(id).success(function(data) {
          Alert.alert('success', data.message);
          if (userId) {
            Users.getOne(userId).success(function(data) {
              Alert.alert('success', data.message);
              var userData = data.data;
              var index = userData.pendingTasks.indexOf(id);
              if (index > -1) {
                userData.pendingTasks.splice(index, 1);

                Users.update(userId, userData).success(function(data) {
                  Alert.alert('success', data.message);
                  getTasks();
                }).error(Alert.error);
              }
            }).error(Alert.error);
          }
          getTasks();

        }).error(Alert.error);
      };
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('UserDetailsController', [
  '$scope',
  '$routeParams',
  '$http',
  '$window',
  'Users',
  'Tasks',
  'Alert',
  function($scope, $routeParams, $http, $window, Users, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      var userId = $routeParams.user_id;
      function getUserInfo() {
        Users.getOne(userId).success(function(data) {
          Alert.alert('success', data.message);
          var userData = data.data;
          $scope.pendingTasks = userData.pendingTasks;
          delete userData.pendingTasks;
          $scope.user = userData;

          Tasks.get({
            where: {
              _id: { $in: $scope.pendingTasks }
            }
          }).success(function(data) {
            Alert.alert('success', data.message);
            $scope.userTasks = data.data;
            Tasks.get({
              where: {
                assignedUser: userId,
                completed: true
              }
            }).success(function(data) {
              Alert.alert('success', data.message);
              $scope.userCompletedTasks = data.data;
            }).error(Alert.error);
           // $scope.userCompletedTasks = null;
          }).error(Alert.error);
        }).error(Alert.error);
      }
      getUserInfo();

      $scope.completeTask = function(taskId) {
        Tasks.getOne(taskId).success(function(data) {
          Alert.alert('success', data.message);
          var task = data.data;
          task.completed = true;

          Tasks.update(taskId, task).success(function(data) {
            Alert.alert('success', data.message);
            var updatedUser = $scope.user;
            var index = $scope.pendingTasks.indexOf(taskId);
            if (index > -1) {
              $scope.pendingTasks.splice(index, 1);
              updatedUser.pendingTasks = $scope.pendingTasks;

              Users.update(updatedUser._id, updatedUser).success(function(data) {
                Alert.alert('success', data.message);
                getUserInfo();
              }).error(Alert.error);
            }
          }).error(Alert.error);
        }).error(Alert.error);
      };


    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('TaskDetailsController', [
  '$scope',
  '$routeParams',
  '$http',
  '$window',
  'Tasks',
  'Alert',
  function($scope, $routeParams, $http, $window, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      var taskId = $routeParams.task_id;
      Tasks.getOne(taskId).success(function(data) {
        Alert.alert('success', data.message);
        var taskData = data.data;
        $scope.assignedUserId = taskData.assignedUser;
        $scope.assignedUserName = taskData.assignedUserName;
        delete taskData.assignedUser;
        delete taskData.assignedUserName;
        $scope.task = taskData;
      }).error(Alert.error);
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('UserAddController', [
  '$scope',
  '$http',
  '$window',
  'Users',
  'Alert',
  function($scope, $http, $window, Users, Alert) {
    if ($window.sessionStorage.baseUrl) {
      $scope.nameError = false;
      $scope.emailError = false;


      $scope.newUser = {
        name: '',
        email: ''
      };

      $scope.submitForm = function() {
        if ( validate($scope.newUser)) {
          $scope.nameError = false;
          $scope.emailError = false;
          Users.create($scope.newUser).success(function(data) {
            Alert.alert('success', data.message);
          }).error(Alert.error);
        }
      };

      function validate(newUser) {
        $scope.nameError = newUser.name.trim() === '';
        $scope.emailError = newUser.email.trim() === '';
        return !($scope.nameError || $scope.emailError);
      }
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('TaskAddController', [
  '$scope',
  '$http',
  '$window',
  'Users',
  'Tasks',
  'Alert',
  function($scope, $http, $window, Users, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      $scope.nameError = false;
      $scope.deadlineError = false;
      $scope.deadlineErrorMsg = '';

      $scope.userList = [
        { label: 'None', value: { _id: '', name: 'unassigned' } }
      ];
      $scope.userChoice = $scope.userList[0];

      $scope.newTask = {
        name: '',
        deadline: '',
        completed: false,
        description: '',
        assignedUser: '',
        assignedUserName: 'unassigned'
      };

      $scope.$watch('userChoice', function(oldVal, newVal) {
        $scope.newTask.assignedUser = $scope.userChoice.value._id;
        $scope.newTask.assignedUserName = $scope.userChoice.value.name;
      });

      Users.get({
        select: {
          _id: 1,
          name: 1
        },
        sort: {
          name: 1
        }
      }).success(function(data) {
        Alert.alert('success', data.message);
        angular.forEach(data.data, function(user) {
          $scope.userList.push({ label: user.name, value: user });
        });
      }).error(Alert.error);

      $scope.submitForm = function() {
        var newTask = $scope.newTask;
        if ( validate($scope.newTask)) {
          $scope.nameError = false;
          $scope.deadlineError = false;
          Tasks.create(newTask).success(function(data) {
            Alert.alert('success', data.message);
            var savedTask = data.data;

            if (newTask.assignedUser && newTask.assignedUserName !== 'unassigned') {
              Users.getOne(newTask.assignedUser).success(function(data) {
                Alert.alert('success', data.message);
                var user = data.data;
                user.pendingTasks.push(savedTask._id);

                Users.update(newTask.assignedUser, user).success(function(data) {
                  Alert.alert('success', data.message);
                }).error(Alert.error);
              }).error(Alert.error);
            }
          }).error(Alert.error);
        }
      };

      function validate(newTask) {
        $scope.nameError = newTask.name.trim() === '';
        $scope.deadlineError = !newTask.deadline
            || new Date(newTask.deadline.trim()) === "Invalid Date"
            || isNaN(new Date(newTask.deadline.trim()));
        $scope.deadlineErrorMsg = newTask.deadline
            ? 'Invalid date'
            : 'Cannot have blank deadline';
        return !($scope.nameError || $scope.deadlineError);
      }
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);

mp4Controllers.controller('TaskEditController', [
  '$scope',
  '$routeParams',
  '$http',
  '$window',
  'Users',
  'Tasks',
  'Alert',
  function($scope, $routeParams, $http, $window, Users, Tasks, Alert) {
    if ($window.sessionStorage.baseUrl) {
      var taskId = $routeParams.task_id;
      $scope.nameError = false;
      $scope.deadlineError = false;
      $scope.deadlineErrorMsg = '';

      $scope.userList = [
        { label: 'None', value: { _id: '', name: 'unassigned' } }
      ];
      $scope.userChoice = $scope.userList[0];

      $scope.newTask = {
        name: '',
        deadline: '',
        completed: false,
        description: '',
        assignedUser: '',
        assignedUserName: 'unassigned'
      };

      $scope.$watch('userChoice', function(oldVal, newVal) {
        $scope.newTask.assignedUser = $scope.userChoice.value._id;
        $scope.newTask.assignedUserName = $scope.userChoice.value.name;
      });

      function findUserInUserList(id, name) {
        var retVal = -1;
        angular.forEach($scope.userList, function(userOption, index) {
          if (userOption.value._id === id
              && userOption.value.name === name) {
            retVal = index;
          }
        });
        return retVal;
      }

      function getTask() {
        Tasks.getOne(taskId).success(function(data) {
          Alert.alert('success', data.message);

          $scope.oldTask = data.data;
          $scope.newTask = data.data;

          $scope.userChoice = $scope.userList[
              findUserInUserList($scope.oldTask.assignedUser, $scope.oldTask.assignedUserName)
              ];
        }).error(Alert.error);
      }

      Users.get({
        select: {
          _id: 1,
          name: 1
        },
        sort: {
          name: 1
        }
      }).success(function(data) {
        Alert.alert('success', data.message);
        angular.forEach(data.data, function(user) {
          $scope.userList.push({ label: user.name, value: user });
        });
        getTask();
      }).error(Alert.error);

      $scope.submitForm = function() {
        var newTask = $scope.newTask;
        var oldTask = $scope.oldTask;
        if (validate($scope.newTask)) {
          $scope.nameError = false;
          $scope.deadlineError = false;
          Tasks.update(taskId, newTask).success(function(data) {
            Alert.alert('success', data.message);
            var savedTask = data.data;

            if (!newTask.completed
                && newTask.assignedUser
                && newTask.assignedUserName !== 'unassigned') {
              Users.getOne(newTask.assignedUser).success(function(data) {
                var user = data.data;
                user.pendingTasks.push(savedTask._id);

                Users.update(newTask.assignedUser, user).success(function(data) {
                  Alert.alert('success', 'Successfully assigned task to new user.');
                }).error(Alert.error);
              }).error(Alert.error);
            }

            if (newTask.completed
                || oldTask.assignedUser !== newTask.assignedUser
                && oldTask.assignedUserName !== newTask.assignedUserName) {
              Users.getOne(oldTask.assignedUser).success(function(data) {
                var user = data.data;
                var index = user.pendingTasks.indexOf(oldTask._id);
                if (index > -1) {
                  user.pendingTasks.splice(index, 1);

                  Users.update(oldTask.assignedUser, user).success(function(data) {
                    Alert.alert('success', 'Successfully removed task from previous user.');
                    getTask();
                  }).error(Alert.error);
                }
              }).error(Alert.error);
            }
          }).error(Alert.error);
        }
      };

      function validate(newTask) {
        $scope.nameError = newTask.name.trim() === '';
        $scope.deadlineError = !newTask.deadline
            || new Date(newTask.deadline.trim()) === "Invalid Date"
            || isNaN(new Date(newTask.deadline.trim()));
        $scope.deadlineErrorMsg = newTask.deadline
            ? 'Invalid date'
            : 'Cannot have blank deadline';
        return !($scope.nameError || $scope.deadlineError);
      }
    } else {
      Alert.alert('alert', 'The URL for the API has not been set yet!');
    }

    $scope.$on('$locationChangeStart', function(event) {
      Alert.reset();
    });
  }
]);
