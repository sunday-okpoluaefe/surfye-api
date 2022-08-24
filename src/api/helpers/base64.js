/**
 * Base 64 functionality
 */
module.exports.Base64 = {
    /**
     * Base 64 encode
     * @param {String}
     * @returns {String}
     */
    encode: (str) => {
        const buff = Buffer.from(str, 'utf8');
        return buff.toString('base64');
    },

    /**
     * Base 64 decode
     * @param {String}
     * @returns {String}
     */
    decode: (str) => {
        const buff = Buffer.from(str, 'base64');
        return buff.toString('utf8');
    }
}