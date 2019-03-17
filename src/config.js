'use strict';

const zip = require('./utils/array-to-hash');

const requireEnsureVars = [
    'scriptBuilder',
    'scriptUrlResolver',
    'scriptOptionsResolver',
];

module.exports = {
    pluginName: 'CustomRuntimePlugin',

    expressions: Object.assign({
        installedChunks: 'installedChunks',
        chunkId: 'chunkId',
        result: 'result',
        url: 'url',
        originalUrl: 'originalUrl'
    }, zip(requireEnsureVars)),

    hooks: {
        scriptBuilder: [ 'source', 'chunk', 'hash' ],
        scriptUrlResolver: [ 'source', 'chunk', 'hash' ],
        scriptOptionsResolver: [ 'source', 'chunk', 'hash' ],

        scriptUrlResolverStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        scriptOptionsResolverStrategy: [ 'array', 'chunk', 'hash', 'expressions' ],
        requireEnsureVars: [ 'source', 'chunk', 'hash', 'expressions' ],
    },

    requireEnsureVars
};
