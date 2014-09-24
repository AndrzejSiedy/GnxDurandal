define(['durandal/system', 'jquery'],
    function (system, $) {
                
        // Routes
        var addExternalLoginUrl = "/api/Account/AddExternalLogin";
        var changePasswordUrl = "/api/Account/changePassword";
        var loginUrl = "/Token";
        var logoutUrl = "/api/Account/Logout";
        var registerUrl = "/api/Account/Register";
        var registerExternalUrl = "/api/Account/RegisterExternal";
        var removeLoginUrl = "/api/Account/RemoveLogin";
        var setPasswordUrl = "/api/Account/setPassword";
        var siteUrl = "/";
        var userInfoUrl = "/api/Account/UserInfo";
        
        // Route operations
        function externalLoginsUrl(returnUrl, generateState) {
            return "/api/Account/ExternalLogins?returnUrl=" + (encodeURIComponent(returnUrl)) +
                "&generateState=" + (generateState ? "true" : "false");
        }

        function manageInfoUrl(returnUrl, generateState) {
            return "/api/Account/ManageInfo?returnUrl=" + (encodeURIComponent(returnUrl)) +
                "&generateState=" + (generateState ? "true" : "false");
        }

        // Other private operations
        function getSecurityHeaders() {
            var accessToken = sessionStorage["accessToken"] || localStorage["accessToken"];

            if (accessToken) {
                return { "Authorization": "Bearer " + accessToken };
            }

            return {};
        }

        // Operations
        var clearAccessToken = function () {
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("accessToken");
        };

        var setAccessToken = function (accessToken, persistent) {
            if (persistent) {
                localStorage["accessToken"] = accessToken;
            } else {
                sessionStorage["accessToken"] = accessToken;
            }
        };

        var toErrorsArray = function (data) {
            var errors = new Array(),
                items;

            if (!data || !data.message) {
                return null;
            }

            if (data.modelState) {
                for (var key in data.modelState) {
                    items = data.modelState[key];

                    if (items.length) {
                        for (var i = 0; i < items.length; i++) {
                            errors.push(items[i]);
                        }
                    }
                }
            }

            if (errors.length === 0) {
                errors.push(data.message);
            }

            return errors;
        };

        // Data
        var returnUrl = siteUrl;

        // Data access operations
        var addExternalLogin = function (data) {
            return $.ajax(addExternalLoginUrl, {
                type: "POST",
                data: data,
                headers: getSecurityHeaders()
            });
        };

        var changePassword = function (data) {
            return $.ajax(changePasswordUrl, {
                type: "POST",
                data: data,
                headers: getSecurityHeaders()
            });
        };

        var getExternalLogins = function (returnUrl, generateState) {
            return $.ajax(externalLoginsUrl(returnUrl, generateState), {
                cache: false,
                headers: getSecurityHeaders()
            });
        };

        var getManageInfo = function (returnUrl, generateState) {
            return $.ajax(manageInfoUrl(returnUrl, generateState), {
                cache: false,
                headers: getSecurityHeaders()
            });
        };

        var getUserInfo = function (accessToken) {
            var headers;

            if (typeof (accessToken) !== "undefined") {
                headers = {
                    "Authorization": "Bearer " + accessToken
                };
            } else {
                headers = getSecurityHeaders();
            }

            return $.ajax(userInfoUrl, {
                cache: false,
                headers: headers
            });
        };

        var login = function (data) {
            return $.ajax(loginUrl, {
                type: "POST",
                data: data
            });
        };

        var logout = function () {
            return $.ajax(logoutUrl, {
                type: "POST",
                headers: getSecurityHeaders()
            });
        };

        var register = function (data) {
            return $.ajax(registerUrl, {
                type: "POST",
                data: data
            });
        };

        var registerExternal = function (accessToken, data) {
            return $.ajax(registerExternalUrl, {
                type: "POST",
                data: data,
                headers: {
                    "Authorization": "Bearer " + accessToken
                }
            });
        };

        var removeLogin = function (data) {
            return $.ajax(removeLoginUrl, {
                type: "POST",
                data: data,
                headers: getSecurityHeaders()
            });
        };

        var setPassword = function (data) {
            return $.ajax(setPasswordUrl, {
                type: "POST",
                data: data,
                headers: getSecurityHeaders()
            });
        };

        return {
            login: login,
            logout: logout,
            register: register,
            getExternalLogins: getExternalLogins,
            returnUrl: returnUrl,
            toErrorsArray: toErrorsArray,
            setAccessToken: setAccessToken,
            clearAccessToken: clearAccessToken,
            addExternalLogin: addExternalLogin,
            changePassword: changePassword,
            setPassword: setPassword,
            removeLogin: removeLogin,
            registerExternal: registerExternal,
            getUserInfo: getUserInfo,
            getManageInfo: getManageInfo
        }
    });