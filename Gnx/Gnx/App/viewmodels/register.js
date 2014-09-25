define(['services/dataservice', 'services/authservice', 'plugins/router'],
    function (dataservice, authservice, router) {

        // Data
        var userName = ko.observable('').extend({ required: true });
        var email = ko.observable('').extend({ required: true });
        var password = ko.observable('').extend({ required: true });
        var confirmPassword = ko.observable('').extend({ required: true, equal: password });

        // Other UI state
        var registering = ko.observable(false);
        var errors = ko.observableArray([]);
        var validationErrors = ko.validation.group([userName, email, password, confirmPassword]);

        // Operations
        var register = function () {
            errors.removeAll();
            if (validationErrors().length > 0) {
                validationErrors.showAllMessages();
                return;
            }
            registering(true);

            dataservice.register({
                userName: userName(),
                email: email(),
                password: password(),
                confirmPassword: confirmPassword()
            }).done(function (data) {
                dataservice.login({
                    grant_type: "password",
                    username: userName(),
                    password: password()
                }).done(function (data) {
                    registering(false);

                    if (data.userName && data.access_token) {
                        authservice.logUserIn(data.userName, data.email, data.access_token, false /* persistent */);
                    } else {
                        errors.push("An unknown error occurred.");
                    }
                }).failJSON(function (data) {
                    registering(false);

                    if (data && data.error_description) {
                        errors.push(data.error_description);
                    } else {
                        errors.push("An unknown error occurred.");
                    }
                });
            }).failJSON(function (data) {
                var serverErrors;

                registering(false);
                serverErrors = dataservice.toErrorsArray(data);

                if (serverErrors) {
                    errors(serverErrors);
                } else {
                    errors.push("An unknown error occurred.");
                }
            });
        };

        var login = function () {
            router.navigate('login');
        };
        
    return {
        userName: userName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        register: register,
        login: login,
        registering: registering,
        errors: errors
    }
});