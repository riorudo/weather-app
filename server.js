// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));


// Setup Server
const port = 3000;
const server = app.listen(port, function() {
    console.log(`Local node.js server is running on port: ${port}!!!`);
});


//Endpoints
const axios = require("axios");
const basicUrl = "https://api.openweathermap.org/data/2.5/weather?";
const apiKey = "appid=6ad16bfda5278e2abe721759f54554ed";

const getWeatherData = async (url = '') => {
    try {
        const res = await axios.get(url);
        const data = res.data;
        return data;
    } catch (e) {
        console.log(e);
    }
}

app.get('/zip', async function (req, res) {
    const url = `${basicUrl}q=${req.query.zip},${req.query.countryCode}&${apiKey}`;
    res.send(await getWeatherData(url));
})

app.get('/coordinates', async function (req, res) {
    const url = `${basicUrl}lat=${req.query.lat}&lon=${req.query.lon}&${apiKey}`;
    res.send(await getWeatherData(url));
})

