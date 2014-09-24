define(['plugins/router', 'services/dataservice', 'services/utils', 'viewmodels/shell'],
    function (router, dataservice, helper, shell) {
        // Data
        var loginProvider = ko.observable();
        var userName = ko.observable(null).extend({ required: true });

        // Other UI state
        var registering = ko.observable(false);
        var externalAccessToken = null;
        var state = null;
        var loginUrl = null;
        var errors = ko.observableArray();
        var validationErrors = ko.validation.group([userName]);

        // data-bind click
        var register = function () {
            errors.removeAll();

            if (validationErrors().length > 0) {
                validationErrors.showAllMessages();
                return;
            }

            registering(true);
            dataservice.registerExternal(externalAccessToken, {
                userName: userName()
            }).done(function (data) {
                sessionStorage["state"] = state;
                // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage
                // temporarily to localStorage to work around this problem.
                helper.archiveSessionStorageToLocalStorage();
                window.location = loginUrl;
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

        var activate = function () {
            userName(shell.user().name());
            loginProvider = shell.user().loginProvider();
            externalAccessToken = shell.user().externalAccessToken();
            loginUrl = shell.user().loginUrl();
            state = shell.user().state();
        };

        return {
            errors: errors,
            register: register,
            loginProvider: loginProvider,
            userName: userName,
            registering: registering,
            externalAccessToken: externalAccessToken,
            loginUrl: loginUrl,
            state: state,
            activate: activate
        }
    });