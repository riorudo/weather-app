/* Global Variables */
const COUNTRY_CODES_URL = '/country-codes';
const NEW_ENTRY_URL = '/new-entry';
const RECENT_ENTRIES_URL = '/recent-entries';
let recentEntriesData = [];

// API requests
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
                    recentEntries().then((data) => {
                        recentEntriesData = [...data];
                        generateEntries(recentEntriesData);
                    });
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

function generateEntries(entries) {
    if (!entries || !entries.length > 0) {
        return;
    }
    const entryList = document.getElementById('entryList');
    let templateElemStr = '';

    entries.forEach((entry, index) => {
        const newEntry = `<li onclick="loadEntry(${index})" class="entryItem">
                            <span><span class="entryLabel">Location: </span>${entry.name}</span><br>
                            <span><span class="entryLabel">Period: </span>${entry.date[0]} - ${entry.date[6]}</span><br>
                            <span><span class="entryLabel">Feelings: </span>${entry.feelings}</span>
                          </li>`;
        templateElemStr = `${templateElemStr}${newEntry}`;
    })
    entryList.innerHTML = '';
    if (templateElemStr) {
        document.getElementById('entry').style.display = 'block';
    }
    entryList.insertAdjacentHTML("beforeend", templateElemStr);
}

function generateCountryCodeDropdownList(countryCodes) {
    const dropdownElem = document.getElementById('countryCode');
    let templateElemStr = `<option value=""> choose a country</option>`;
    for (let i = 0; i < countryCodes.length; i++) {
        const newDropdownItem = `<option value="${countryCodes[i].alpha2Code}">${countryCodes[i].name}</option>`;
        templateElemStr = `${templateElemStr}${newDropdownItem}`;
    }
    dropdownElem.insertAdjacentHTML("beforeend", templateElemStr);
}

// Load entry form recent entries list
function loadEntry(index) {
    drawChart(recentEntriesData[index]);
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function drawChart(data) {
    const canvas = document.getElementById("weatherChart");
    canvas.style.backgroundColor = 'rgba(242, 53, 87, 0.1)';
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
            labels: data.date,
            datasets: [
                {
                    label: 'min ℃',
                    borderColor: 'rgb(34, 178, 218)',
                    fill: false,
                    data: data.minTemp
                },
                {
                    label: 'max ℃',
                    borderColor: 'rgb(242, 53, 87)',
                    fill: false,
                    data: data.maxTemp
                }
            ]
        },
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: `Temperature in ${data.name}`
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
            recentEntries().then((data) => {
                recentEntriesData = [...data];
                generateEntries(recentEntriesData);
            });
            window.scrollTo({top: 0, behavior: 'smooth'});
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
