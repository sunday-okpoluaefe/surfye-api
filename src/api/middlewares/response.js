const Response = require('../services/respond');

/**
 * Middleware helper function
 * Bind to res object
 * Attach to req object
 */
module.exports.respond = (req, res, next) => {
    req.respond = new Response(res);
    next();
}
