'use strict';

const BasePlugin = require('../BasePlugin');

class ErrorHandlerPlugin extends BasePlugin {

    constructor(name, options) {
        super(
            `ErrorHandler(${name})`,
            options,
            'scriptErrorHandlerStrategy'
        );
    }
}

module.exports = ErrorHandlerPlugin;

ErrorHandlerPlugin.RetryOnError = require('./RetryOnError');
