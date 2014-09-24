define(['knockout'],
    function (ko) {

        var addExternalLoginProviderViewModel = function (data, helper) {
            var self = this;

            // Data
            self.name = ko.observable(data.name);

            // Operations
            self.login = function () {
                sessionStorage["state"] = data.state;
                sessionStorage["associatingExternalLogin"] = true;
                // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage temporarily
                // to localStorage to work around this problem.
                helper.archiveSessionStorageToLocalStorage();
                window.location = data.url;
            };

            return self;
        };

        var changePasswordViewModel = function (parent, name, dataservice) {
            var self = this;

            // Private operations
            function reset() {
                self.errors.removeAll();
                self.oldPassword(null);
                self.newPassword(null);
                self.confirmPassword(null);
                self.changing(false);
                self.validationErrors.showAllMessages(false);
            }

            // Data
            self.name = ko.observable(name);
            self.oldPassword = ko.observable('').extend({ required: true });
            self.newPassword = ko.observable('').extend({ required: true });
            self.confirmPassword = ko.observable('').extend({ required: true, equal: self.newPassword });

            // Other UI state
            self.changing = ko.observable(false);
            self.errors = ko.observableArray();
            self.validationErrors = ko.validation.group([self.oldPassword, self.newPassword, self.confirmPassword]);

            // Operations
            self.change = function () {
                self.errors.removeAll();
                if (self.validationErrors().length > 0) {
                    self.validationErrors.showAllMessages();
                    return;
                }
                self.changing(true);

                dataservice.changePassword({
                    oldPassword: self.oldPassword(),
                    newPassword: self.newPassword(),
                    confirmPassword: self.confirmPassword()
                }).done(function (data) {
                    self.changing(false);
                    reset();
                    parent.message("Your password has been changed.");
                }).failJSON(function (data) {
                    var serverErrors;

                    self.changing(false);
                    serverErrors = dataservice.toErrorsArray(data);

                    if (serverErrors) {
                        self.errors(serverErrors);
                    } else {
                        self.errors.push("An unknown error occurred.");
                    }
                });
            };

            return self;
        };

        var externalLoginProviderViewModel = function (helper, data) {
            var self = this;

            // Data
            self.name = ko.observable(data.name);

            // Operations
            self.login = function () {
                sessionStorage["state"] = data.state;
                sessionStorage["loginUrl"] = data.url;
                // IE doesn't reliably persist sessionStorage when navigating to another URL. Move sessionStorage temporarily
                // to localStorage to work around this problem.
                helper.archiveSessionStorageToLocalStorage();
                window.location = data.url;
            };

            return self;
        };

        var removeLoginViewModel = function (data, viewModel, dataservice) {
            // Private state
            var self = this;
            var parent = viewModel;
            var providerKey = ko.observable(data.providerKey);

            // Data
            self.loginProvider = ko.observable(data.loginProvider);

            // Other UI state
            self.removing = ko.observable(false);

            // Operations
            self.remove = function () {
                parent.errors.removeAll();
                self.removing(true);
                dataservice.removeLogin({
                    loginProvider: self.loginProvider(),
                    providerKey: providerKey()
                }).done(function (data) {
                    self.removing(false);
                    parent.logins.remove(self);
                    parent.message("The login was removed.");
                }).failJSON(function (data) {
                    var serverErrors;

                    self.removing(false);
                    serverErrors = dataservice.toErrorsArray(data);

                    if (serverErrors) {
                        parent.errors(serverErrors);
                    } else {
                        parent.errors.push("An unknown error occurred.");
                    }
                });
            };

            return self;
        };

        var setPasswordViewModel = function (parent, dataservice) {
            var self = this;

            // Data
            self.newPassword = ko.observable('').extend({ required: true });
            self.confirmPassword = ko.observable('').extend({ required: true, equal: self.newPassword });

            // Other UI state
            self.setting = ko.observable(false);
            self.errors = ko.observableArray();
            self.validationErrors = ko.validation.group([self.newPassword, self.confirmPassword]);

            // Operations
            self.set = function () {
                self.errors.removeAll();
                if (self.validationErrors().length > 0) {
                    self.validationErrors.showAllMessages();
                    return;
                }
                self.setting(true);

                dataservice.setPassword({
                    newPassword: self.newPassword(),
                    confirmPassword: self.confirmPassword()
                }).done(function (data) {
                    self.setting(false);

                    parent.logins.push(new removeLoginViewModel({
                        loginProvider: parent.localLoginProvider(),
                        providerKey: parent.userName()
                    }, parent));
                    parent.message("Your password has been set.");
                }).failJSON(function (data) {
                    var serverErrors;

                    self.setting(false);
                    serverErrors = dataservice.toErrorsArray(data);

                    if (serverErrors) {
                        self.errors(serverErrors);
                    } else {
                        self.errors.push("An unknown error occurred.");
                    }
                });
            };

            return self;
        };

        var userInfoViewModel = function (name, loginProvider, externalAccessToken, loginUrl, state) {
            var self = this;

            // Data
            self.name = ko.observable(name);
            self.loginProvider = ko.observable(loginProvider);
            self.externalAccessToken = ko.observable(externalAccessToken);
            self.loginUrl = ko.observable(loginUrl);
            self.state = ko.observable(state);

            return self;
        };

        return {
            ExternalLoginProviderViewModel: externalLoginProviderViewModel,
            UserInfoViewModel: userInfoViewModel,
            ChangePasswordViewModel: changePasswordViewModel,
            RemoveLoginViewModel: removeLoginViewModel,
            AddExternalLoginProviderViewModel: addExternalLoginProviderViewModel,
            SetPasswordViewModel: setPasswordViewModel
        }
    });