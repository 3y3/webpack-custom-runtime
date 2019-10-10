'use strict';

/**
 * ES3 compatible script preload link builder
 *
 * This is a pure function. It can be converted to string and called in any place.
 * So all that it requires should be defined inside or passed in params.
 */
module.exports = function prelinkBuilder(
    installedChunks,
    chunkId,
    scriptUrlResolver,
    scriptOptionsResolver
) {
    var link = document.createElement('link');
    var url = scriptUrlResolver(installedChunks, chunkId, '{linkType}');
    var options = extend({
        // most compatible type
        type: 'text/javascript',
        charset: 'utf-8',
        rel: '{linkType}',
        as: 'script'
    }, scriptOptionsResolver(installedChunks, chunkId, url, '{linkType}'));

    extend(link, options);

    link.href = url;

    return link;

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
