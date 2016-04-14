var mp4Services = angular.module('mp4Services', []);



mp4Services.factory('Tasks', function($http, $window) {
    return {
        get : function(params) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.get(baseUrl + '/api/tasks', {
                params: params
            });
        },
        create: function(data) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.post(baseUrl + '/api/tasks', data);
        },
        getOne: function(id) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.get(baseUrl + '/api/tasks/' + id);
        },
        update: function(id, data) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.put(baseUrl + '/api/tasks/' + id, data);
        },
        delete: function(id) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.delete(baseUrl + '/api/tasks/' + id);
        }
    };
});



mp4Services.factory('Users', function($http, $window) {
    return {
        get : function(params) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.get(baseUrl + '/api/users', {
                params: params
            });
        },
        create: function(data) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.post(baseUrl + '/api/users', data);
        },
        getOne: function(id) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.get(baseUrl + '/api/users/' + id);
        },
        update: function(id, data) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.put(baseUrl + '/api/users/' + id, data);
        },
        delete: function(id) {
            var baseUrl = $window.sessionStorage.baseUrl;
            return $http.delete(baseUrl + '/api/users/' + id);
        }
    };
});

mp4Services.factory('Alert', function() {
    var alert = function(status, message) {
        alertObject.messages.push({
            status: status,
            message: message
        });
    };

    alertObject = {
        messages: [],
        showAlerts: true,
        alert: alert,
        error: function(data) {
            if (data && data.message) {
                alert('alert', data.message);
            } else {
                alert('alert', 'No response from server.');
            }
        },
        remove: function(index) {
            this.messages.splice(index, 1);
        },
        reset: function() {
            this.messages = [];
        }
    };

    return alertObject;
});
