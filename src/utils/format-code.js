'use strict';

const prettier = require('prettier');

module.exports = (code) => {
    try {
        return prettier.format(code, {
            singleQuote: true,
            parser: 'babel'
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};
