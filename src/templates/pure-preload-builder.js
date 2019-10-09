'use strict';

/**
 * ES3 compatible script preload link builder
 *
 * This is a pure function. It can be converted to string and called in any place.
 * So all that it requires should be defined inside or passed in params.
 */
module.exports = function preloadBuilder(
    installedChunks,
    chunkId,
    scriptUrlResolver,
    scriptOptionsResolver
) {
    var link = document.createElement('link');
    var url = scriptUrlResolver(installedChunks, chunkId, 'preload');
    var options = extend({
        // most compatible type
        type: 'text/javascript',
        charset: 'utf-8',
        rel: 'preload',
        as: 'script'
    }, scriptOptionsResolver(installedChunks, chunkId, url, 'preload'));

    extend(link, options);

    link.href = url;

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
