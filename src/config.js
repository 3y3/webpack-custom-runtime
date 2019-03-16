'use strict';

const requireEnsureVars = [];

module.exports = {
    pluginName: 'CustomRuntimePlugin',

    hooks: {
        requireEnsureVars: [ "source", "chunk", "hash", "expressions" ],
    },

    requireEnsureVars
};
