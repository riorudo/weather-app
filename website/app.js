/* Global Variables */

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth() + '.' + d.getDate() + '.' + d.getFullYear();


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

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const url = `/coordinates?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
            getWeatherData(url)
                .then((data) => {
                    console.log('data by coordinates');
                    console.log(data);
                });
        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}


setTimeout(() => {
    const url = `/zip?zip=8046&countryCode=ch`
    getWeatherData(url)
        .then((data) => {
            console.log('data by zip');
            console.log(data);
        });

    getLocation();
}, 0);
