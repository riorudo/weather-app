// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();
const port = 3000;
const basicUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?";
const apiKey = "appid=6ad16bfda5278e2abe721759f54554ed";
const countyCodeAPIUrl = 'https://restcountries.eu/rest/v2/all';
let countryCodes = [];

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());
// Cors for cross origin allowance
const cors = require('cors');

app.use(cors());


// Initialize the main project folder
app.use(express.static('website'));


// Setup Server
const server = app.listen(port, function () {
    console.log(`Local node.js server is running on port: ${port}!!!`);
});
//Endpoints
const axios = require("axios");
const getWeatherData = async (url = '') => {
    try {
        const res = await axios.get(url);
        const data = res.data;
        return data;
    } catch (e) {
        console.log(e);
    }

};

const getCountryCodes = async () => {
    try {
        const res = await axios.get(countyCodeAPIUrl);
        const data = res.data.map( (item) => {
            return { name: item.name, alpha2Code: item.alpha2Code.toLowerCase()};
        });
        return data;
    } catch (e) {
        console.log(e);
    }
};


app.get('/country-codes', async function (req, res) {
    // Get the country codes only the first time from API
    if (!countryCodes || !countryCodes.length > 0) {
        countryCodes = await getCountryCodes();
    }
    res.send(countryCodes);
})

app.get('/zip', async function (req, res) {
    const url = `${basicUrl}q=${req.query.zip},${req.query.countryCode}&${apiKey}`;
    res.send(await getWeatherData(url));
})

app.get('/coordinates', async function (req, res) {
    const url = `${basicUrl}lat=${req.query.lat}&lon=${req.query.lon}&${apiKey}`;
    res.send(await getWeatherData(url));
})

