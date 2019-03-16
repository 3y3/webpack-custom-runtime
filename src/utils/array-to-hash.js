'use strict';

/**
 * @param {Array} array
 * @returns {Object}
 */
module.exports = function(array) {
    return array.reduce((acc, name) => Object.assign(acc, { [name]: name }), {});
};
