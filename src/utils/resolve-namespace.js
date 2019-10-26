'use strict';

const replaceEnv = require('./replace-env');

module.exports = function resolveNamespace(options, requireFn) {
    let namespace = replaceEnv(options.namespace, { requireFn });

    if (!namespace.match(/.*?\..*?|.*?\[.*?\]/)) {
        namespace = 'window.' + namespace;
    }

    return namespace;
};
