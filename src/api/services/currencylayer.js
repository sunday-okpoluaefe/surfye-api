/**
 * Currency Layer Integration
 */
const axios = require('axios');
const config = require('config');
const getCountry = require("country-currency-map").getCountry

let currencyLayer = {
    baseUrl: 'https://apilayer.net/api/live',
};

/**
 * Get Exchange Rate
 * @param {String} currencies
 * @param {String} source
 */
currencyLayer.getRate = async (currencies, source) => {
    let response;
    try {
        response = await axios.get(`${currencyLayer.baseUrl}?access_key=${config.get('currencylayer.accessKey')}&&currencies=${currencies}&source=${source}&&format=1`);
    } catch (error) {
        console.log(error);
        return null;
    }

    if(!response || !response.data)
        return null;

    if(response.data.success)
        return response.data.quotes;
    return null
}

currencyLayer.getCountry = (name) =>{
    let country = {
        name: 'Not Available',
        abbr: 'Not Available',
        currency: 'USD'
    }

    let data = getCountry(name)

    if(data) country = {
        name : name,
        abbr: data.abbreviation,
        currency: data.currency
    }

    return country

}

module.exports = currencyLayer;
