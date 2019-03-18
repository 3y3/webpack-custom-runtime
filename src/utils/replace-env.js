'use strict';

module.exports = function(string, env) {
    return string.replace(/{(.*?)}/g, (_, match) => env[match] || `{${match}}`);
};
