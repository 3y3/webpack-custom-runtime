'use strict';

const zip = require('./utils/array-to-hash');

const requireEnsureBaseVars = [
    'scriptUrlResolver',
    'scriptOptionsResolver'
];

const requireEnsureVars = requireEnsureBaseVars.concat([
    'scriptBuilder',
    'scriptLoadHandler',
    'scriptErrorHandler'
]);

module.exports = {
    pluginName: 'CustomRuntimePlugin',

    expressions: Object.assign({
        installedChunks: 'installedChunks',
        chunkId: 'chunkId',
        result: 'result',
        url: 'url',
        mode: 'mode',
        originalError: 'originalError',
        originalUrl: 'originalUrl'
    }, zip(requireEnsureVars)),

    hooks: {
        scriptBuilder: [ 'source', 'chunk', 'hash' ],
        scriptUrlResolver: [ 'source', 'chunk', 'hash' ],
        scriptOptionsResolver: [ 'source', 'chunk', 'hash' ],
        scriptLoadHandler: [ 'source', 'chunk', 'hash' ],
        scriptErrorHandler: [ 'source', 'chunk', 'hash' ],

        scriptUrlResolverStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        scriptOptionsResolverStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        scriptLoadHandlerStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        scriptErrorHandlerStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        requireEnsureVars: [ 'source', 'chunk', 'hash', 'expressions' ],
    },

    pluginsToMute: {
        requireEnsure: [
            'JsonpMainTemplatePlugin load'
        ],
        linkPreload: [
            'JsonpMainTemplatePlugin'
        ]
    },

    requireEnsureBaseVars,

    requireEnsureVars
};
