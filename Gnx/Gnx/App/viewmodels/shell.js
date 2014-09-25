define(['plugins/router', 'knockout', 'services/authservice', 'services/utils', 'services/dataservice', 'plugins/history'],
    function (router, ko, authservice, helper, dataservice, history) {

        var router = router;
        var loggedIn = ko.observable(false);
        var user = ko.observable();

        var errors = ko.observableArray([]);

        var activate = function () {
            
            var fragment = helper.getFragment();

            helper.restoreSessionStorageFromLocalStorage();
            helper.verifyStateMatch(fragment);

            if (sessionStorage["associatingExternalLogin"]) {
                associateExternalLogin(fragment);
            }
            else if (typeof (fragment.error) !== "undefined") {
                setupAnonymousRoutes();
                errors.push("External login failed.");
            } else if (typeof (fragment.access_token) !== "undefined") {
                dataservice.getUserInfo(fragment.access_token)
                    .done(function (data) {
                        if (typeof (data.userName) !== "undefined" && typeof (data.hasRegistered) !== "undefined"
                            && typeof (data.loginProvider) !== "undefined") {
                            if (data.hasRegistered) {
                                authservice.logUserIn(data.userName, fragment.access_token, false);
                            }
                            else if (typeof (sessionStorage["loginUrl"]) !== "undefined") {
                                loginUrl = sessionStorage["loginUrl"];
                                sessionStorage.removeItem("loginUrl");
                                authservice.registerUserExternal(data.userName, data.loginProvider, fragment.access_token,
                                    loginUrl, fragment.state);
                            }
                            else {
                                setupAnonymousRoutes();
                            }
                        } else {
                            setupAnonymousRoutes();
                        }
                    })
                    .fail(function () {
                        setupAnonymousRoutes();
                    });
            } else {
                dataservice.getUserInfo()
                    .done(function (data) {
                        if (data.userName) {
                            authservice.logUserIn(data.userName, null, false);
                        } else {
                            setupAnonymousRoutes();
                        }
                    })
                    .fail(function () {
                        setupAnonymousRoutes();
                    });
            }
        };

        function associateExternalLogin(fragment) {
            sessionStorage.removeItem("associatingExternalLogin");

            var externalAccessToken, externalError, loginUrl;

            if (typeof (fragment.error) !== "undefined") {
                externalAccessToken = null;
                externalError = fragment.error;
            } else if (typeof (fragment.access_token) !== "undefined") {
                externalAccessToken = fragment.access_token;
                externalError = null;
            } else {
                externalAccessToken = null;
                externalError = null;
            }

            dataservice.getUserInfo()
                .done(function (data) {
                    if (data.userName) {
                        authservice.associateExternalLogin(data.userName, externalAccessToken, externalError);
                    } else {
                        setupAnonymousRoutes();
                    }
                })
                .fail(function () {
                    setupAnonymousRoutes();
                });
        }

        var logOff = function () {
            authservice.logOff();
        };

        var setupAuthenticatedRoutes = function () {
            configureRouter(addAuthenticatedRoutes);
        };

        var setupAnonymousRoutes = function () {
            configureRouter(addAnonymousRoutes);
        };

        var setupRegisterExternalRoutes = function () {
            configureRouter(addRegisterExternalRoutes);
        };

        function configureRouter(useRoutes) {
            router.reset();

            router.makeRelative({ moduleId: 'viewmodels' });

            useRoutes(router);

            router.buildNavigationModel();

            router.mapUnknownRoutes('home', 'home');

            if (!history.active) {
                router.activate();
            }
        }

        function addAuthenticatedRoutes(router) {
            router.map([
                { route: '', moduleId: 'home', nav: 1 },
                { route: 'module', moduleId: 'module', nav: 2 },
                { route: 'about', moduleId: 'about', nav: 3 },
                { route: 'manage', moduleId: 'manage', nav: 4 }
            ]);
        }

        function addAnonymousRoutes(router) {
            router.map([
                { route: '', moduleId: 'home', nav: 1 },
                { route: 'about', moduleId: 'about', nav: 2 },
                { route: 'login', moduleId: 'login', nav: 3 },
                { route: 'register', moduleId: 'register', nav: 4 }
            ]);
        }

        function addRegisterExternalRoutes(router) {
            router.map([
                { route: 'about', moduleId: 'about', nav: 1 },
                { route: 'login', moduleId: 'login', nav: 2 },
                { route: 'register', moduleId: 'register', nav: 3 },
                { route: 'registerExternal', moduleId: 'registerExternal', nav: 4 }
            ]);
        }

        return {
            activate: activate,
            loggedIn: loggedIn,
            errors: errors,
            setupAnonymousRoutes: setupAnonymousRoutes,
            setupAuthenticatedRoutes: setupAuthenticatedRoutes,
            setupRegisterExternalRoutes: setupRegisterExternalRoutes,
            user: user,
            logOff: logOff
        };
    });