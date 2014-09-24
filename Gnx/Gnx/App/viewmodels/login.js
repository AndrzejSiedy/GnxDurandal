define(['services/dataservice', 'services/model', 'services/utils', 'services/authservice', 'plugins/router'],
    function (dataservice, model, helper, authservice, router) {

        // Private state
        var validationTriggered = ko.observable(false);

        // Data
        var userName = ko.observable('').extend({ required: true });
        var password = ko.observable('').extend({ required: true });
        var rememberMe = ko.observable(false);
        var externalLoginProviders = ko.observableArray([]);
        var validationErrors = ko.validation.group([userName, password]);

        // Other UI state
        var errors = ko.observableArray([]);
        var loadingExternalLogin = ko.observable(true);
        var loggingIn = ko.observable(false);

        var hasExternalLogin = ko.computed(function () {
            return externalLoginProviders().length > 0;
        });

        // Operations
        function login() {
            errors.removeAll();

            if (validationErrors().length > 0) {
                validationErrors.showAllMessages();
                return;
            }

            loggingIn(true);

            dataservice.login({
                grant_type: "password",
                username: userName(),
                password: password()
            }).done(function (data) {
                loggingIn(false);

                if (data.userName && data.access_token) {
                    authservice.logUserIn(data.userName, data.access_token, rememberMe());
                } else {
                    errors.push("An unknown error occurred.");
                }
            }).failJSON(function (data) {
                loggingIn(false);

                if (data && data.error_description) {
                    errors.push(data.error_description);
                } else {
                    errors.push("An unknown error occurred.");
                }
            });
        }

        // Private operations
        function initialize() {
            dataservice.getExternalLogins(dataservice.returnUrl, true /* generateState */)
                .done(function (data) {
                    loadingExternalLogin(false);
                    if (typeof (data) === "object") {
                        for (var i = 0; i < data.length; i++) {
                            externalLoginProviders.push(new model.ExternalLoginProviderViewModel(helper, data[i]));
                        }
                    } else {
                        errors.push("An unknown error occurred.");
                    }
                }).fail(function () {
                    loadingExternalLogin(false);
                    errors.push("An unknown error occurred.");
                });
        }

        initialize();

        return {
            userName: userName,
            password: password,
            rememberMe: rememberMe,
            errors: errors,
            loggingIn: loggingIn,
            login: login,
            loadingExternalLogin: loadingExternalLogin,
            hasExternalLogin: hasExternalLogin,
            externalLoginProviders: externalLoginProviders,
            validationErrors: validationErrors
        }
    });