const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherContent = document.getElementById('weather-content');
const forecastContainer = document.getElementById('forecast-container');
const cityTitle = document.getElementById('city-title');
const errorMessage = document.getElementById('error-message');

// Простая функция для сопоставления кодов погоды Open-Meteo с текстом
function getWeatherDescription(code) {
    const codes = {
        0: 'Ясно',
        1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
        45: 'Туман', 48: 'Иней с туманом',
        51: 'Легкая морось', 53: 'Умеренная морось', 55: 'Плотная морось',
        61: 'Небольшой дождь', 63: 'Умеренный дождь', 65: 'Сильный дождь',
        71: 'Небольшой снегопад', 73: 'Умеренный снегопад', 75: 'Сильный снегопад',
        77: 'Снежные зерна',
        80: 'Слабый ливень', 81: 'Сильный ливень', 82: 'Ливневый шторм',
        85: 'Слабый снежный ливень', 86: 'Сильный снежный ливень',
        95: 'Гроза', 96: 'Гроза с градом'
    };
    return codes[code] || 'Смешанные условия';
}

async function getWeather(cityName) {
    try {
        errorMessage.style.display = 'none';

        // 1. Получаем координаты города через бесплатное Geocoding API
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=ru`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Город не найден');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2. Запрашиваем погоду на 3 дня по полученным координатам
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        displayWeather(name, country, weatherData.daily);

    } catch (error) {
        console.error(error);
        errorMessage.style.display = 'block';
        weatherContent.style.display = 'none';
    }
}

function displayWeather(city, country, dailyData) {
    weatherContent.style.display = 'block';
    cityTitle.textContent = `${city}, ${country}`;
    forecastContainer.innerHTML = '';

    // Нам нужны первые 3 дня
    for (let i = 0; i < 3; i++) {
        const dateObj = new Date(dailyData.time[i]);
        const formattedDate = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        
        let dayLabel = formattedDate;
        if (i === 0) dayLabel = 'Сегодня';
        if (i === 1) dayLabel = 'Завтра';

        const temp = Math.round(dailyData.temperature_2m_max[i]);
        const conditionText = getWeatherDescription(dailyData.weathercode[i]);

        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <div class="date">${dayLabel}</div>
            <div class="temp">${temp}°C</div>
            <div class="condition">${conditionText}</div>
        `;
        forecastContainer.appendChild(card);
    }
}

// Слушатели событий
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') getWeather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim() !== '') getWeather(cityInput.value);
});

// Запуск при старте страницы
getWeather(cityInput.value);