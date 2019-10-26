'use strict';

const BasePlugin = require('../BasePlugin');

class LoadingHandlerPlugin extends BasePlugin {

    constructor(name, options) {
        super(
            `LoadingHandler(${name})`,
            options,
            'scriptLoadingHandlerStrategy'
        );
    }
}

module.exports = LoadingHandlerPlugin;
