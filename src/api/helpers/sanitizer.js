/**
 * Helper Sanitizer functions
 */
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const { Cast } = require('./cast');

module.exports.Sanitizer = {
    /**
     * Check if argument is integer
     * Cast argument to number
     * @param {String} num
     * @returns {Number}
     */
    isInteger: (num) => {
        if(num === null) return null;

        if(Number.isInteger(+num)) return true;
        return null;
    },

    /**
     * Check if argument is email
     * @param {String} email
     * @returns {Boolean}
     */
    isEmail: (email) => {
        const { error } = Joi.string().email().validate(email);
        if(error) return null;
        return true;
    },

    /**
     * Check if argument is array
     * @param {Array} arr
     * @returns {Boolean}
     */
    isArray: (arr) => {
        return Array.isArray(arr);
    },

    /**
     * Check if argument is ISO Date
     * Cast argument to ISO Date
     * @param {String} date
     * @returns {Date}
     */
    isISODate: (date) => {
        const { error, value } = Joi.date().iso().validate(date);
        if(error) return null;
        return value;
    },

    /**
     * Check if argument is ObjectId
     * @param {String}dateString
     * @returns {boolean}
     */
    isMinor: (dateString) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        return age < 18;
    },

    /**
     * Check if argument is ObjectId
     * @param {String} id
     * @returns {ObjectId}
     */
    isObjectId: (id) => {
        const { error, value } = Joi.objectId().validate(id);
        if(error) return null;
        return value;
    },
}
