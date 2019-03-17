'use strict';

/**
 * This is a pure function. It can be converted to string and called in any place.
 * So all that it requires should be defined inside or passed in params.
 *
 * ES3 compatible, but requires PromiseA+ polyfill.
 */
module.exports = function(
    installedChunks,
    chunkId,
    scriptBuilder,
    scriptUrlResolver,
    scriptOptionsResolver
) {
    // JSONP chunk loading for javascript

    var INSTALLED = 0;
    var PROMISE_RESOLVE = 0;
    var PROMISE_REJECT = 1;
    var LOAD_PROMISE = 2;

    var installedChunkData = installedChunks[chunkId];

    if (installedChunkData === INSTALLED || installedChunkData) {
        return installedChunkData === INSTALLED
            ? Promise.resolve()
            : installedChunkData[LOAD_PROMISE];
    }

    var url, options, script, error;

    installedChunkData = installedChunks[chunkId] = [];
    installedChunkData[LOAD_PROMISE] = new Promise(function(resolve, reject) {
        installedChunkData[PROMISE_RESOLVE] = resolve;
        installedChunkData[PROMISE_REJECT] = reject;
    })
    .catch(setError)
    .then(checkScriptLoaded);

    Promise.resolve()
        .then(resolveUrlAndOptions)
        .then(buildScript)
        .then(setScript)
        .then(appendScript)
        .catch(installedChunkData[PROMISE_REJECT]);

    return installedChunkData[LOAD_PROMISE];

    function checkScriptLoaded() {
        var chunk = installedChunks[chunkId];
        var isChunkComplete = chunk === INSTALLED;

        // ignore any errors if chunk is loaded
        if (isChunkComplete) {
            return;
        }

        installedChunks[chunkId] = undefined;

        error = error || new Error('Failed to load resource');
        error.type = error.type || 'missing';
        error.request = script.src;
        error.chunkId = chunkId;

        throw error;
    }

    function buildScript() {
        // scriptBuilder can be asynchronous for old school strategies like `blob loading`
        return scriptBuilder(
            url,
            options,
            installedChunkData[PROMISE_RESOLVE],
            installedChunkData[PROMISE_REJECT]
        );
    }

    function resolveUrlAndOptions() {
        url = scriptUrlResolver(installedChunks, chunkId);
        options = scriptOptionsResolver(installedChunks, chunkId, url);
    }

    function appendScript() {
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function setError(_error) {
        error = _error;
    }

    function setScript(_script) {
        script = _script;
    }
};
