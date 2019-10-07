'use strict';

const BasePlugin = require('../BasePlugin');

class ScriptAttrPlugin extends BasePlugin {

    constructor(name, options) {
        super(
            `ScriptAttr(${name})`,
            options,
            'scriptOptionsResolverStrategy'
        );
    }
}

module.exports = ScriptAttrPlugin;

ScriptAttrPlugin.Type = require('./Type');
ScriptAttrPlugin.Timeout = require('./Timeout');
ScriptAttrPlugin.Nonce = require('./Nonce');
ScriptAttrPlugin.Integrity = require('./Integrity');
ScriptAttrPlugin.CrossOrigin = require('./CrossOrigin');
