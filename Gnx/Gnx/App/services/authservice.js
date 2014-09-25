define(['services/dataservice', 'services/model', 'plugins/router'],
    function (dataservice, model, router) {

        var logUserIn = function (userName, accessToken, persistent) {

            var shell = require('viewmodels/shell');

            shell.errors.removeAll();

            if (accessToken) {
                dataservice.setAccessToken(accessToken, persistent);
            }

            shell.user(new model.UserInfoViewModel(userName));
            shell.loggedIn(true);
            shell.setupAuthenticatedRoutes();

            router.navigate('#');
        };

        var associateExternalLogin = function (userName, externalAccessToken, externalError) {
            var shell = require('viewmodels/shell');

            shell.errors.removeAll();

            shell.user(new model.UserInfoViewModel(userName));
            shell.loggedIn(true);
            shell.setupAuthenticatedRoutes();

            if (externalError !== null || externalAccessToken === null) {
                errors.push("Failed to associated external login.");
            } else {
                dataservice.addExternalLogin({
                    externalAccessToken: externalAccessToken
                }).done(function (data) {

                    router.navigate('manage');

                }).failJSON(function (data) {
                    var serverErrors = dataservice.toErrorsArray(data);

                    if (serverErrors) {
                        shell.errors(serverErrors);
                    } else {
                        shell.errors.push("An unknown error occurred.");
                    }

                    router.navigate('manage');
                });
            }
        };
        
        var registerUserExternal = function (userName, loginProvider, externalAccessToken, loginUrl, state) {

            var shell = require('viewmodels/shell');

            shell.errors.removeAll();

            shell.user(new model.UserInfoViewModel(userName, loginProvider, externalAccessToken, loginUrl, state));
            shell.loggedIn(false);
            shell.setupRegisterExternalRoutes();

            router.navigate('registerExternal');
        };

        var logOff = function () {

            var shell = require('viewmodels/shell');

            shell.errors.removeAll();

            dataservice.clearAccessToken();

            shell.user(null);
            shell.loggedIn(false);
            shell.setupAnonymousRoutes();

            router.navigate('home');
        };

        return {
            logUserIn: logUserIn,
            logOff: logOff,
            registerUserExternal: registerUserExternal,
            associateExternalLogin: associateExternalLogin
        }
    });