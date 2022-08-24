const axios = require('axios');

/**
 * abstracts function to send push notifications
 */

let push_service = {};

push_service.push = async ( data ) => {

    const key = process.env.FCM_SERVER_KEY;
    const url = process.env.FCM_API_URL;

    try {
        const result = await axios.post(url,
            data
            ,{
                headers: {
                    Accept: 'application/json, */*',
                    'Content-type': 'application/json',
                    Authorization: `key=${key}`
                }
            })

        return result.data;
    }
    catch(error){
        // handle errors here
        //console.log('error', error);
        return null;
    }
}

push_service.send_to_one = async(title, data, deviceToken) => {

    let payload = {
        data: {
            title: title,
            meta: data,
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },

        to: deviceToken
    }

    return push_service.push(payload)
}

push_service.send_to_topic = async(title, data, topic) => {

    let payload = {
        data: {
            title: title,
            meta: data,
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
    }

    payload['to'] = '/topics/' + topic

    return push_service.push(payload)
}

module.exports.push_service = push_service;
