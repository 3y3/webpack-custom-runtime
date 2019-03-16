'use strict';

/**
 * ES3, IE8 compatible script builder
 *
 * This is a pure function. It can be converted to string and called in any place.
 * So all that it requires should be defined inside or passed in params.
 *
 * @param {String} src - script url
 * @param {Object} options - script attributes
 * @param {function()} onSuccess
 * @param {function(error)} onError
 * @returns {?Script}
 */
module.exports = function scriptBuilder(src, options, onSuccess, onError) {
    var script, timeout;

    var onScriptComplete = function(error) {
        onScriptComplete = function() {};

        // avoid mem leaks in IE.
        script.onerror = script.onload = script.onreadystatechange = null;

        clearTimeout(timeout);

        error ? onError(error) : onSuccess();
    };

    try {
        options = extend({
            // most compatible type
            type: 'text/javascript',
            charset: 'utf-8',
            timeout: 20,
            async: true
        }, options);

        script = document.createElement('script');

        extend(script, options);

        script.onload = function() {
            onScriptComplete();
        };

        timeout = setTimeout(function() {
            onScriptComplete(error('timeout'));
        }, options.timeout * 1000);

        script.onerror = function(event) {
            onScriptComplete(error(event && (event.type === 'load' ? 'missing' : event.type)));
        };

        script.onreadystatechange = function () { // for compatibility with old IE
            if (script.readyState === 'complete' || script.readyState === 'loaded') {
                onScriptComplete(); // there is no way to catch loading errors in IE8
            }
        };

        script.src = src;
    } catch (e) {
        clearTimeout(timeout);
        timeout = setTimeout(onScriptComplete, 0, error('script'))
    }

    return script;

    function error(reason) {
        var error = new Error('Failed to load resource');

        error.type = reason;

        return error;
    }

    function extend(acc, src) {
        if (src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) {
                    acc[key] = src[key];
                }
            }
        }

        return acc;
    }
};
