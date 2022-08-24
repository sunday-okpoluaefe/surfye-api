/**
 * Directory
 */

const getRequired = function(file) {
    return require(file);
}

const fs = require('fs');
module.exports = (directoryPath) => {
    let files = fs.readdirSync(directoryPath);
    let target = {};
    files.forEach(file => {
        if (file.match(/\.js$/i)) {
            const mods = require(`${directoryPath}/${file}`);
            Object.assign(target, {...mods} );
        }
    });
    return target;
}
