const MAP_ZOOM = 10;
const API_KEY = '88d0cf4160af7b4af3665e74437c66b9';
const MAX_ABS_LAT = 90;
const MAX_ABS_LON = 180;
const ABS_ZERO = -273.15;

const widgetsList = document.getElementById("widgetsList")
const showWeatherButton = document.getElementById("showButton");
showWeatherButton.addEventListener("click", showWeather);

let widgetsMapButtonList = [];
let map;

ymaps.ready(initMap);

function initMap() {
    map = new ymaps.Map(`map`, {
        center: [56.8519, 60.6122],
        zoom: MAP_ZOOM
    });
}

function showWeather() {
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;
    if (checkCoordinatesInvalidity(lat, lon)) {
        document.getElementById('invalidCoordinates').innerText = 'Некоректные координаты';
        return;
    }
    document.getElementById('invalidCoordinates').innerText = '';
    getWeather(lat, lon);
}

function checkCoordinatesInvalidity(lat, lon) {
    return !isNumber(lat) 
        || !isNumber(lon)
        || !isNumber(lat - 0)
        || !isNumber(lon - 0)
        || Math.abs(parseFloat(lat)) > MAX_ABS_LAT
        || Math.abs(parseFloat(lon)) > MAX_ABS_LON;
}

function isNumber(num) {
    return typeof parseFloat(num) === 'number' && isFinite(parseFloat(num));
}

function getWeather(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=ru`;
    const widgetId = crypto.randomUUID();
    fetch(apiUrl)
        .then((response) => {
            return response.json();
        })
        .then((weatherData) => {
            const lat = weatherData.coord.lat;
            const lon = weatherData.coord.lon;
            const html = getWeatherWidgetHtml(weatherData, widgetId);
            map.setCenter([lat, lon], MAP_ZOOM);
            widgetsList.insertAdjacentHTML("beforeend", html);
            showMiniMap(lat, lon, widgetId);
            widgetsMapButtonList.push({id: widgetId, lat: lat, lon: lon});
            widgetsMapButtonList.map((widgetMapButton) => {
                document.getElementById(widgetMapButton.id)?.addEventListener('click', () => {
                    map.setCenter([widgetMapButton.lat, widgetMapButton.lon], MAP_ZOOM);
                }, false);
            })
        });
}

function getWeatherWidgetHtml(weatherData, widgetId) {
    return `<div class="weatherWidget">
        <div id="lat">Широта: ${weatherData.coord.lat}</div>
        <div id="lon">Долгота: ${weatherData.coord.lon}</div>
        <div id="temperature">Температура: ${(weatherData.main.temp + ABS_ZERO).toFixed(2)}°</div>
        <div id="wind">Скорость ветра: ${weatherData.wind.speed} м/c</div>
        <div id="humidity">Влажность: ${weatherData.main.humidity}%</div>
        <img class="widgetWeatherIcon" src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png">
        <div class="widgetWeatherDesc">${weatherData.weather[0].description}</div>
        <div class="widgetMiniMap" id="map-${widgetId}"></div>
        <button class="widgetMapButton" id="${widgetId}">Карта</button>
        <button class="removeWidgetButton" onclick="this.parentNode.remove()">Удалить</button>
    </div>`
}

function showMiniMap(lat, lon, index) {
    ymaps.ready(
        new ymaps.Map(`map-${index}`, { 
            center: [lat, lon], 
            zoom: MAP_ZOOM, 
        }));
}