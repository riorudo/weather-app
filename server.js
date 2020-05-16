// Setup empty JS object to act as endpoint for all routes
projectData = {
    countryCodes: [],
    recentEntries: []
};

// Require Express to run server and routes
const express = require('express');

// Require moment to format date
const moment = require('moment');

// Start up an instance of app
const app = express();
const port = 3000;
const basicUrl = "https://api.openweathermap.org/data/2.5/forecast/daily?";
const apiKey = "appid=6ad16bfda5278e2abe721759f54554ed";
const countyCodeAPIUrl = 'https://restcountries.eu/rest/v2/all';

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

// Helper functions
// Check if obj in array
function containsObj(array, entry) {
    return array.some(elem => JSON.stringify(elem) === JSON.stringify(entry));
}

// Create unique entry for weather data request
function createEntry(weatherData, feelings) {
    if (!weatherData) {
        return;
    }
    const entry = {...weatherData, feelings};
    if (!containsObj(projectData.recentEntries, entry)) {
        projectData.recentEntries.push(entry);
    }
}

function mapWeatherDataValues(days, key) {
    if (!days || days.length < 1) {
        return;
    }
    const dataArr = [];
    days.forEach((day) => {
        let dataItem;
        // Access nested object property over string path like 'temp.day'
        switch (key) {
            case ('dt'):
                dataItem = moment.unix(day.dt).format("MM/DD/YYYY");
                break;
            case ('temp.min'):
            case ('temp.max'):
                dataItem = (key.split('.').reduce((p, c) => p && p[c] || null, day) - 273.15).toFixed(2);
                break;
            default:
                dataItem = [];
                break;
        }
        dataArr.push(dataItem);
    });
    return dataArr;
}

//Endpoints
const axios = require("axios");
const getWeatherData = async (url = '') => {
    try {
        const res = await axios.get(url);
        const data = {};
        data.name = res.data.city.name;
        data.coord = res.data.city.coord;
        data.date = mapWeatherDataValues(res.data.list, 'dt');
        data.minTemp = mapWeatherDataValues(res.data.list, 'temp.min');
        data.maxTemp = mapWeatherDataValues(res.data.list, 'temp.max');
        return data;
    } catch (e) {
        console.log("error", e);
    }
};

const getCountryCodes = async () => {
    try {
        const res = await axios.get(countyCodeAPIUrl);
        const data = res.data.map((item) => {
            return {name: item.name, alpha2Code: item.alpha2Code.toLowerCase()};
        });
        return data;
    } catch (e) {
        console.log("error", e);
    }
};

app.get('/country-codes', async function (req, res) {
    // Get the country codes only the first time from API
    if (!projectData.countryCodes || !projectData.countryCodes.length > 0) {
        projectData.countryCodes = await getCountryCodes();
    }
    res.send(projectData.countryCodes);
})

app.get('/coordinates', async function (req, res) {
    const url = `${basicUrl}lat=${req.query.lat}&lon=${req.query.lon}&${apiKey}`;
    res.send(await getWeatherData(url));
})

app.post('/new-entry', async function (req, res) {
    const data = req.body;
    const url = `${basicUrl}q=${data.zip},${data.countryCode}&${apiKey}`;
    const weatherData = await getWeatherData(url);
    createEntry(weatherData, data.feelings);
    res.send(weatherData);
})

app.get('/recent-entries', async function (req, res) {
    res.send(projectData.recentEntries.reverse());
})

