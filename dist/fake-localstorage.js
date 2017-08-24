/****************************************************************************
	fake-localstorage.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/fake-localstorage
	https://github.com/FCOO

****************************************************************************/

(function (window/*, document, undefined*/) {
	"use strict";
	
    /*********************************************************************
    Determinate if localStorage is supported and available
    If the browser is in 'Private' mode not all browser supports localStorage
    In localStorage isn't supported a fake version is installed
    At the moment no warning is given when localStorage isn't supported since
    some browser in private-mode allows the use of window.localStorage but 
    don't save it when the session ends
    *********************************************************************/
    window.fake_localstorage_installed = false;

    // Test taken from https://gist.github.com/engelfrost/fd707819658f72b42f55
    if (typeof window.localStorage === 'object') {
        // Safari will throw a fit if we try to use localStorage.setItem in private browsing mode. 
        try {
            localStorage.setItem('localStorageTest', 1);
            localStorage.removeItem('localStorageTest');
            window.fake_localstorage_installed = false;
        } 
        catch (e) {
            window.fake_localstorage_installed = true;
        }
    } 
    else 
        window.fake_localstorage_installed = true;        

    if (window.fake_localstorage_installed){
        /*********************************************************************
        Create a fake localStorage for any browser that does not support it.

        Taken from https://gist.github.com/engelfrost/fd707819658f72b42f55:
            Fake localStorage implementation. 
            Mimics localStorage, including events. 
            It will work just like localStorage, except for the persistant storage part. 
        *********************************************************************/
        var fakeLocalStorage = {};
        var storage; 
  
        // If Storage exists we modify it to write to our fakeLocalStorage object instead. 
        // If Storage does not exist we create an empty object. 
        if (window.Storage && window.localStorage) {
            storage = window.Storage.prototype; 
        } else {
            // We don't bother implementing a fake Storage object
            window.localStorage = {}; 
            storage = window.localStorage; 
        }
  
        // For older IE
        if (!window.location.origin) {
            window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        }

        var dispatchStorageEvent = function(key, newValue) {
            var oldValue = (key == null) ? null : storage.getItem(key); // `==` to match both null and undefined
            var url = location.href.substr(location.origin.length);
            var storageEvent = document.createEvent('StorageEvent'); // For IE, http://stackoverflow.com/a/25514935/1214183

            storageEvent.initStorageEvent('storage', false, false, key, oldValue, newValue, url, null);
            window.dispatchEvent(storageEvent);
        };

        storage.key = function(i) {
            var key = Object.keys(fakeLocalStorage)[i];
            return typeof key === 'string' ? key : null;
        };

        storage.getItem = function(key) {
            return typeof fakeLocalStorage[key] === 'string' ? fakeLocalStorage[key] : null;
        };

        storage.setItem = function(key, value) {
            dispatchStorageEvent(key, value);
            fakeLocalStorage[key] = String(value);
        };

        storage.removeItem = function(key) {
            dispatchStorageEvent(key, null);
            delete fakeLocalStorage[key];
        };

        storage.clear = function() {
            dispatchStorageEvent(null, null);
            fakeLocalStorage = {};
        };
    }
}(this));