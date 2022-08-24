/**
 * Helper Sanitizer functions
 */
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.Cast = {
    /**
     * Cast argument to number
     * @param {String} num
     * @returns {Number}
     */
    number: (num) => {
        return Number(num)
    },

    /**
     * Cast argument to ISO Date
     * @param {Date} date
     * @returns {Date}
     */
    isoDate: (date) => {
        const d = new Date(date);
        return d.toISOString();
    },

    /**
     * Cast argument to ObjectId
     * @param {String} id
     * @returns {ObjectId}
     */
    objectId: (id) => {
        return mongoose.Types.ObjectId(id);
    },
}