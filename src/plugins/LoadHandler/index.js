'use strict';

const BasePlugin = require('../BasePlugin');

class LoadHandlerPlugin extends BasePlugin {

    constructor(name, options) {
        super(
            `LoadHandler(${name})`,
            options,
            'scriptLoadHandlerStrategy'
        );
    }
}

module.exports = LoadHandlerPlugin;
