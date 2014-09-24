requirejs.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

define('jquery', function() { return jQuery; });
define('knockout', ko);

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'knockout'],
    function (system, app, viewLocator, ko) {
        system.debug(true);
        app.title = 'Durandal Single Page Application';

        ko.validation.init({ grouping: { observable: false } });

        app.configurePlugins({
            router: true,
            dialog: true,
            widget: true
        });

        app.start().then(function() {

            viewLocator.useConvention();

            app.setRoot('viewmodels/shell');
        });
    });