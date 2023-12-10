document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("forecast-button");
    var container = document.getElementById("forecast-container");

    button.addEventListener("click", function () {
        // Toggle the visibility of the forecast-container
        container.style.display = (container.style.display === "none" || container.style.display === "") ? "block" : "none";
    });
});

const enter_address_btn = document.querySelector("#enter-address-btn");
const current_address_btn = document.querySelector("#current-address-btn");
const container = document.querySelector(".container");

current_address_btn.addEventListener('click', () => {
    container.classList.add("current-address-mode");
});
enter_address_btn.addEventListener('click', () => {
    container.classList.remove("current-address-mode");
});

const x = document.getElementById("demo");
const apiKey = 'b4a44113af2c49eba6294c002abd4997';  // Replace with your Geoapify API key
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
function getUVIndexWithCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    latitudeInput.value = position.coords.latitude;
    longitudeInput.value = position.coords.longitude;

    const apiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&type=city&lang=en&limit=1&format=json&apiKey=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(result => {
            const formattedAddress = result.results[0].formatted;
            document.getElementById('address').value = formattedAddress;
        })
        .catch(error => console.log('error', error));
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred.";
            break;
    }
}