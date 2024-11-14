const apiKey = 'bace882a4f21fc29da8a914ea86d7297';
const cityInput = document.getElementById('cityInput');
const suggestions = document.getElementById('suggestions');
const unitToggle = document.getElementById('unitToggle');
let isCelsius = true;

async function searchCity() {
    const query = cityInput.value;
    if (query.length < 3) {
        suggestions.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&appid=${apiKey}`);
        const data = await response.json();
        showSuggestions(data.list);
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

function showSuggestions(cities) {
    suggestions.innerHTML = '';
    cities.forEach(city => {
        const div = document.createElement('div');
        div.textContent = `${city.name}, ${city.sys.country}`;
        div.onclick = () => selectCity(city.name);
        suggestions.appendChild(div);
    });
}

function selectCity(city) {
    cityInput.value = city;
    suggestions.innerHTML = '';
    fetchWeather(city);
}

async function fetchWeather(city) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`);
        const data = await response.json();
        displayCurrentWeather(data);
        fetchForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('weatherCondition').textContent = data.weather[0].description;
    document.getElementById('highLow').textContent = `H: ${Math.round(data.main.temp_max)}° L: ${Math.round(data.main.temp_min)}°`;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

async function fetchForecast(lat, lon) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`);
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) {
        const day = data.list[i];
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        forecastItem.innerHTML = `
            <h4>${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
            <p>${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</p>
        `;
        forecastGrid.appendChild(forecastItem);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function fetchWeatherByLocation(latitude, longitude) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`);
        const data = await response.json();
        displayCurrentWeather(data);
        fetchForecast(latitude, longitude);
    } catch (error) {
        console.error("Error fetching weather by location:", error);
    }
}

function toggleUnits() {
    isCelsius = !isCelsius;
    const city = document.getElementById('cityName').textContent.split(',')[0];
    if (city) fetchWeather(city);
}
