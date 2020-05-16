/* Global Variables */
const COUNTRY_CODES_URL = '/country-codes';
const NEW_ENTRY_URL = '/new-entry';
const RECENT_ENTRIES_URL = '/recent-entries';

// Get weather data from server
const getWeatherData = async (url = '') => {
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    try {
        return await res.json();
    } catch (e) {
        console.log(e);
    }
}

const postEntry = async (url = '', data = {}) => {
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    try {
        return await res.json();
    } catch (e) {
        console.log("error", e);
    }
}

// Get country codes from server
const getCountyCodes = async (url = '') => {
    const res = await fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    try {
        return await res.json();
    } catch (e) {
        console.log("error", e);
    }
}

// Get current location from browser api and init page
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const url = `/coordinates?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
            getWeatherData(url)
                .then((data) => {
                    drawChart(data);
                    recentEntries().then((data) => console.log(data));
                });
        });
    } else {
        const msgNoGeolocation = document.getElementById('msgNoGeolocation');
        msgNoGeolocation.innerHTML = "Geolocation is not supported by this browser.";
    }
}

// Get recent entries form node server
const recentEntries = async () => {
    const res = await fetch(RECENT_ENTRIES_URL, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    try {
        return await res.json();
    } catch (e) {
        console.log("error", e);
    }
}

function mapWeatherDataValues(days, key) {
    if (!days || days.left < 1) {
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

function generateCountryCodeDropdownList(countryCodes) {
    const dropdownElem = document.getElementById('countryCode');
    let templateElemStr = `<option value="">Choose a country</option>`;
    for (let i = 0; i < countryCodes.length; i++) {
        const newDropdownItem = `<option value="${countryCodes[i].alpha2Code}">${countryCodes[i].name}</option>`;
        templateElemStr = `${templateElemStr}${newDropdownItem}`;
    }
    dropdownElem.insertAdjacentHTML("beforeend", templateElemStr);
}


function drawChart(data) {
    const canvas = document.getElementById("weatherChart");
    canvas.style.backgroundColor = 'rgba(242, 53, 87, 0.1)';
    const ctx = canvas.getContext('2d');
    const date = mapWeatherDataValues(data.list, 'dt');
    const minTemp = mapWeatherDataValues(data.list, 'temp.min');
    const maxTemp = mapWeatherDataValues(data.list, 'temp.max');
    const chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            labels: date,
            datasets: [
                {
                    label: 'min ℃',
                    borderColor: 'rgb(34, 178, 218)',
                    fill: false,
                    data: minTemp
                },
                {
                    label: 'max ℃',
                    borderColor: 'rgb(242, 53, 87)',
                    fill: false,
                    data: maxTemp
                }
            ]
        },
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: `Temperature in ${data.city.name}`
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function submitForm(ev) {
    ev.preventDefault();
    const elements = ev.target.elements;
    let obj = {};
    for (let item of elements) {
        obj[item.name] = item.value;
    }
    postEntry(NEW_ENTRY_URL, obj)
        .then((data) => {
            if (!data) {
                alert(`No data could be found for your current entries`);
            }
            drawChart(data);
            recentEntries().then((data) => console.log(data));
        });
}

setTimeout(() => {
    getCountyCodes(COUNTRY_CODES_URL)
        .then((countryCodes) => {
            generateCountryCodeDropdownList(countryCodes);
        });
    getLocation();
    document.getElementById('weatherForm').addEventListener('submit', submitForm)
}, 0);
