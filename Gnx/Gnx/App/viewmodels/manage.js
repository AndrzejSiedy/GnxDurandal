define(['knockout', 'plugins/router', 'services/dataservice', 'services/model', 'services/utils'],
    function (ko, router, dataservice, model, helper) {

        var startedLoad = false;

        // UI state used by private state
        var logins = ko.observableArray([]);

        // Private state
        var hasLocalPassword = ko.computed(function () {
            var loginsList = logins();

            for (var i = 0; i < loginsList.length; i++) {
                if (loginsList[i].loginProvider() === localLoginProvider()) {
                    return true;
                }
            }

            return false;
        });

        // Data
        var userName = ko.observable();
        var localLoginProvider = ko.observable();

        // UI state
        var externalLoginProviders = ko.observableArray([]);
        var loading = ko.observable(true);
        var message = ko.observable();
        var errors = ko.observableArray();

        var hasExternalLogin = ko.computed(function () {
            return externalLoginProviders().length > 0;
        });

        var canRemoveLogin = ko.computed(function () {
            return logins().length > 1;
        });

        var changePassword = ko.computed(function () {
            if (loading() || !hasLocalPassword()) {
                return null;
            }

            return new model.ChangePasswordViewModel(vm, vm.userName(), dataservice);
        });

        var setPassword = ko.computed(function () {
            if (loading() || hasLocalPassword()) {
                return null;
            }

            return new model.SetPasswordViewModel(vm, dataservice);   
        });
       
        // Operations
        var load = function () { // Load user management data
            if (!startedLoad) {
                startedLoad = true;

                dataservice.getManageInfo(dataservice.returnUrl, true /* generateState */)
                    .done(function (data) {
                        if (typeof (data.localLoginProvider) !== "undefined" &&
                            typeof (data.userName) !== "undefined" &&
                            typeof (data.logins) !== "undefined" &&
                            typeof (data.externalLoginProviders) !== "undefined") {
                            userName(data.userName);
                            localLoginProvider(data.localLoginProvider);

                            for (var i = 0; i < data.logins.length; i++) {
                                logins.push(new model.RemoveLoginViewModel(data.logins[i], vm, dataservice));
                            }

                            for (var i = 0; i < data.externalLoginProviders.length; i++) {
                                externalLoginProviders.push(new model.AddExternalLoginProviderViewModel(data.externalLoginProviders[i], helper));
                            }

                        } else {
                            errors.push("Error retrieving user information.");
                        }

                        loading(false);
                    }).failJSON(function (data) {
                        var serverErrors;

                        loading(false);
                        serverErrors = dataservice.toErrorsArray(data);

                        if (serverErrors) {
                            errors(serverErrors);
                        } else {
                            errors.push("Error retrieving user information.");
                        }
                    });
            }
        };

        var attached = function (view, parent, context) {
            load();
        };

        var vm = {
            logins: logins,
            userName: userName,
            localLoginProvider: localLoginProvider,
            externalLoginProviders: externalLoginProviders,
            loading: loading,
            message: message,
            errors: errors,
            hasExternalLogin: hasExternalLogin,
            canRemoveLogin: canRemoveLogin,
            load: load,
            attached: attached,
            changePassword: changePassword,
            setPassword: setPassword
        };

        return vm;

    });