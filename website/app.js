/* Global Variables */

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
        console.log(e);
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
                });
        });
    } else {
        const msgNoGeolocation = document.getElementById('msgNoGeolocation');
        msgNoGeolocation.innerHTML = "Geolocation is not supported by this browser.";
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
            case ('temp.day'):
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
    const dropdownElem = document.getElementById('country');
    let templateElemStr = `<option value="">Choose a country</option>`;
    for (let i = 0; i < countryCodes.length; i++) {
        const newDropdownItem = `<option value="${countryCodes[i].alpha2Code}">${countryCodes[i].name}</option>`;
        templateElemStr = `${templateElemStr}${newDropdownItem}`;
    }
    dropdownElem.insertAdjacentHTML("beforeend", templateElemStr);
}


function drawChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const date = mapWeatherDataValues(data.list, 'dt');
    const tempDay = mapWeatherDataValues(data.list, 'temp.day');
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
                    label: `day ℃`,
                    borderColor: 'rgba(240, 215, 57)',
                    fill: false,
                    data: tempDay
                },
                {
                    label: 'min ℃',
                    borderColor: 'rgba(34, 178, 218)',
                    fill: false,
                    data: minTemp
                },
                {
                    label: 'max ℃',
                    borderColor: 'rgba(242, 53, 87)',
                    fill: false,
                    data: maxTemp
                }
            ]
        },
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: `Temperature for the next 7 days in ${data.city.name}`
            }
        }
    });
}


setTimeout(() => {
    const url = `/zip?zip=8046&countryCode=ch`
    getWeatherData(url)
        .then();
    getCountyCodes('/country-codes')
        .then((countryCodes) => {
            generateCountryCodeDropdownList(countryCodes);
        });
    getLocation();
}, 0);
