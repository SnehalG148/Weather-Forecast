const apiKey = "4aa450041973ce1f6f3023cbd830a8f0";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

// Map OpenWeather conditions to local images
const weatherImages = {
    "Clouds": "clouds 1.png",
    "Mist": "mist 1.png",
    "Clear": "clear 2.png",
    "Drizzle": "drizzle 1.png",
    "Rain": "2275.png",
    "Snow": "snow.webp",
    "Thunderstorm": "clim.webp"
};

// Function to fetch and display current weather
async function getWeather() {
    let city = document.getElementById("searchBox").value.trim();
    if (!city) return alert("Please enter a city name");

    try {
        let response = await fetch(`${apiUrl}${city}&appid=${apiKey}&units=metric`);
        let data = await response.json();

        if (data.cod !== 200) {
            alert("City not found!");
            return;
        }
        console.log("Weather Data:", data);

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temperature").innerText = `${data.main.temp}°C`;
        document.getElementById("condition").innerText = data.weather[0].description;
        document.getElementById("humidity").innerHTML = `${data.main.humidity}%<br>Humidity`;
        document.getElementById("windSpeed").innerHTML = `${data.wind.speed} km/h<br>Wind Speed`;
        document.getElementById("pressure").innerHTML = `${data.main.pressure} hPa<br>Pressure`;

        let sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        let sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById("sunrise").innerHTML = `${sunriseTime} <br>Sunrise`;
        document.getElementById("sunset").innerHTML = `${sunsetTime} <br>Sunset`;

        // Update the weather icon
        let weatherCondition = data.weather[0].main;
        let weatherIconSrc = `images/${weatherImages[weatherCondition] || "clouds 1.png"}`;
        document.getElementById("weatherIcon").src = weatherIconSrc;
        document.getElementById("weatherIcon").alt = weatherCondition;
        document.getElementById("weatherIcon").style.width = "250px";
        document.getElementById("weatherIcon").style.height = "250px";

        getForecast(city); // Fetch forecast data
    } catch (error) {
        alert("Error fetching weather data!");
        console.error(error);
    }
}

// Function to fetch and display weather forecast (5-day forecast)
async function getForecast(city) {
    try {
        let response = await fetch(`${forecastUrl}${city}&appid=${apiKey}&units=metric`);
        let data = await response.json();

        if (data.cod !== "200") {
            alert("Error fetching forecast data!");
            return;
        }

        let forecastContainer = document.getElementById("forecastContainer");
        forecastContainer.innerHTML = "<h2>5 Days Forecast:</h2>";

        let dailyForecasts = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0]; // Extract YYYY-MM-DD
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = item;
            }
        });

        Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
            let date = new Date(forecast.dt * 1000).toLocaleDateString("en-GB", { weekday: 'long', day: 'numeric', month: 'short' });
            let temp = Math.round(forecast.main.temp) + "°C";
            let weatherCondition = forecast.weather[0].main;
            let weatherIcon = `images/${weatherImages[weatherCondition] || "clouds 1.png"}`;

            let forecastItem = document.createElement("div");
            forecastItem.classList.add("forecast-item");
            forecastItem.innerHTML = `
                <img src="${weatherIcon}" class="icon" alt="Weather Icon">
                <span class="temp">${temp}</span>
                <span class="date">${date}</span>
            `;
            forecastContainer.appendChild(forecastItem);
        });

        // Hourly Forecast
        let hourlyForecastContainer = document.querySelector(".hourly-forecast");
        hourlyForecastContainer.innerHTML = ""; // Clear previous data

        data.list.slice(0, 5).forEach(forecast => {
            let time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            let weatherIcon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

            let hourlyItem = document.createElement("div");
            hourlyItem.classList.add("hourly-item");
            hourlyItem.innerHTML = `
                <p class="hour-time">${time}</p>
                <img src="${weatherIcon}" class="hour-icon" alt="Weather">
                <p class="hour-temp">${Math.round(forecast.main.temp)}°C</p>
                <img src="images/navigation 5.png" class="hour-wind-icon">
                <p class="hour-wind">${forecast.wind.speed} km/h</p>
            `;
            hourlyForecastContainer.appendChild(hourlyItem);
        });
    } catch (error) {
        console.error("Error fetching forecast data:", error);
        alert("Failed to fetch forecast data. Please try again later.");
    }
}

// Function to determine wind direction
function getWindDirection(degrees) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(degrees / 45) % 8];
}

// Get weather by current location
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            try {
                let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
                let data = await response.json();
                document.getElementById("searchBox").value = data.name;
                getWeather();
            } catch (error) {
                alert("Failed to get weather data for your location.");
                console.error(error);
            }
        }, () => {
            alert("Location access denied!");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

document.querySelector(".current-location-btn").addEventListener("click", getCurrentLocationWeather);

// Dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("darkModeToggle");
    const body = document.body;
    toggle.addEventListener("change", () => {
        body.classList.toggle("dark-mode", toggle.checked);
    });
});

// Update time every second
function updateTime() {
    const now = new Date();
    document.querySelector(".time").textContent = now.toLocaleTimeString();
    document.querySelector(".date").textContent = now.toDateString();
}
updateTime();
setInterval(updateTime, 1000);
