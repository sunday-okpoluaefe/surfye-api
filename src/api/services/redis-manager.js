const Redis = require("ioredis");

let controller = {}

controller.set = async (key = "", value= "") =>{
    //const redis = new Redis(); // uses defaults unless given configuration object
    return await (new Redis()).set( key, value); // returns promise which resolves to string, "OK"
}

controller.get = async (key = "") =>{
    //const redis = new Redis(); // uses defaults unless given configuration object
    return await (new Redis()).get( key ); // returns promise which resolves to string, "OK"
}

module.exports.Redis = controller
