const mongoose = require('mongoose');

/**
 * Generate unique ID
 * @returns {String}
 */
module.exports.UniqueId = () => {
    return mongoose.Types.ObjectId().toString();
}
