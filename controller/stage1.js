const { config } = require('dotenv');
const axios = require('axios');
const NodeGeocoder = require('node-geocoder');
const weather = require('openweather-apis');


config();
//geocoder config
const geocoderOptions = {
    provider: 'locationiq',
    apiKey: process.env.LOCATIONIQ_API_KEY,
};

const geocoder = NodeGeocoder(geocoderOptions);

//weather API config
weather.setLang('en');
weather.setUnits('metric');
weather.setAPPID(process.env.IPGEOLOCATION_API_KEY);

exports.greetVisitor = async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIpAddress = req.ip.includes('::ffff:') ? req.ip.split('::ffff:')[1] : req.ip;

    let location = 'unknown';
    let temperature = 'unknown';

    //checking for local IP
    if (clientIpAddress === '127.0.0.1' || clientIpAddress === '::1') {
        location = 'Lagos'; //default location
    } else {
        try {
            //to fetch the geolocation data
            const geoRes = await geocoder.geocode(clientIpAddress);
            const geoData = geoRes[0];

            if (geoData) {
                location = geoData.city || 'unknown';
                console.log('Geo data:', geoData);

                //to fetch the weather data
                weather.setCity(location);
                weather.getTemperature((err, temp) => {
                    if (err) {
                        console.error('Error fetching weather data:', err);
                    } else {
                        temperature = temp;
                        console.log('Weather data:', temp);

                        res.json({
                            client_ip: clientIpAddress,
                            location: location,
                            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${location}.`
                        });
                    }
                });
            }
        } catch (error) {
            console.log('Error fetching location or weather data:', error.message);
        }
    }
};
