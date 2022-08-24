/**
 * FlutterWave Integration
 */
const axios = require('axios');
const config = require('config');
const { City } = require('../providers/models');
const currencyLayer = require('../services/currencylayer')

let location = {}

location.textSearch = async (query = '') => {
    let response = {}
    try {
        response = await axios.get(`${process.env.GOOGLE_PLACES_URL}place/textsearch/json?query=${query}&key=${process.env.GOOGLE_API_KEY}`)
        return response.data.status === 'OK' ? response.data.results : []
    } catch (error) {
        return [];
    }
}

location.price = async ( stats, loc ) => {

    const address = await location.reverse(loc)
    if(address.length < 1) return null

    const formatted_address_components = address[0].formatted_address.split(',')
    const country_ = formatted_address_components[formatted_address_components.length - 1]
    const city_ = formatted_address_components[formatted_address_components.length - 2]
    let country = currencyLayer.getCountry(country_.trim())

    let city = await City.findOne({
        $and: [
            {
                name: city_.trim()
            },
            {
                'country.name': country_.trim()
            }
        ]
    })

    if(!city){
        city = City({
            name: city_.trim(),
            country: country,
            base: process.env.BASE_COST,
            costPerMinute: process.env.COST_PER_MINUTE,
            costPerKm: process.env.COST_PER_KM,
            point: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
            }
        })

        await city.save()
    }

    const {origin_addresses, destination_addresses, rows } = stats

    const duration = rows[0].elements[0].duration
    const duration_traffic = rows[0].elements[0].duration_in_traffic

    const lower = (((( duration.value / 60 ) * city.costPerMinute ) + city.base ) / process.env.COST_DIVISOR);
    const upper = (((( duration_traffic.value / 60 ) * city.costPerMinute ) + city.base ) / process.env.COST_DIVISOR)

    return {
        originAddress: origin_addresses[0],
        destinationAddress: destination_addresses[0],
        originCountry: country,
        originCity: city_.trim(),
        stats: rows[0].elements[0],
        minPrice: lower.toFixed(0) * 1,
        maxPrice: upper.toFixed(0) * 1
    }
}

location.distance = async (origins, destinations) => {
    let response = {}
    try {
        response = await axios.get(`${process.env.GOOGLE_PLACES_URL}` +
        `distancematrix/json?units=metric&origins=${origins}` +
        `&destinations=${destinations}` +
        `&departure_time=now&key=${process.env.GOOGLE_API_KEY}`)
        return response.data.status === 'OK' ? response.data : null
    } catch (error) {
        return null;
    }
}

location.format = ( points ) => {
    let data = points.map( loc => {
        return `${loc.latitude},${loc.longitude}`
    })

    return data.join('|')
}

location.reverse = async ( data )=> {
    let { latitude, longitude } = data
    let response = {}

    try {
        response = await axios.get(`${process.env.GOOGLE_PLACES_URL}geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`)
        return response.data.status === 'OK' ? response.data.results : []
    } catch (error) {
        return [];
    }
}

module.exports.LocationService = location
