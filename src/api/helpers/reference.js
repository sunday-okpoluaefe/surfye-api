

module.exports.reference = (length = 12) => {

    let timestamp = + new Date;

    const ts = timestamp.toString();
    const parts = ts.split("").reverse();
    let id = "";

    for(let i = 0; i < length; ++i ) {
        const index =  Math.floor(Math.random() * ((parts.length - 1)  + 1));//_getRandomInt(0, parts.length - 1);
        id += parts[index];
    }

    return id;
}

module.exports.get_reference = (length = 12) => {
    return this.reference(length);
}
