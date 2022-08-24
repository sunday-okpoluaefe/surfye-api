const validation = require('../services/validation');
const Schemas = require('../providers/validations');
const { Base64 } = require('./base64');
const { SetErrorData } = require('./set-error-data');

/**
 * Parse token in link
 * E.g Forgot password token
 * @params {String} linkToken
 * @returns {Object}
 */
module.exports.ParseLinkToken = (linkToken) => {
    const params = Base64.decode(linkToken).split("&");
    if(!Array.isArray(params) || params.length != 2) 
        return {error: SetErrorData({link: "Invalid link"})};

    const valid = validation.validate(Schemas.linkToken, {email: params[0], token: params[1]});

    if(valid.error) valid.error = validation.parseError(error);
    return valid;
}