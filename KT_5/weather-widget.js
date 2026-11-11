class WeatherWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.city = this.getAttribute('city') || 'Vladivostok';
        this.loadWeather();
    }

    async loadWeather() {
        this.render({
             temp: '—',
             condition: 'Загрузка...',
             humidity: '—', 
             wind: '—' 
            });

        try {
            const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${this.city}&count=1&language=ru&format=json`;
            const geoResponse = await fetch(searchUrl);
            const geoData = await geoResponse.json();
            let lat;
            let lon;
            
            if (geoData.results && geoData.results.length > 0) {
                lat = geoData.results[0].latitude;
                lon = geoData.results[0].longitude;
            }
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
            const weatherResponse = await fetch(weatherUrl);
            const data = await weatherResponse.json();
            const current = data.current;
            
            this.render({
                temp: current.temperature_2m + '°C',
                condition: this.getConditionText(current.weather_code),
                humidity: current.relative_humidity_2m + '%',
                wind: current.wind_speed_10m + ' км/ч'
            });

        } catch (error) {
            this.render({ 
                temp: '—', 
                condition: 'Ошибка загрузки', 
                humidity: '—', 
                wind: '—' });
        }
    }

    getConditionText(code) {
        if (code === 0) return 'Ясно';
        if (code <= 3) return 'Облачно';
        if (code <= 48) return 'Туман';
        if (code <= 67) return 'Дождь';
        if (code <= 77) return 'Снег';
        return 'Осадки';
    }

    render(data) {
        this.shadowRoot.innerHTML = `
        <style>
            .card {
                width: 100%; 
                height: 100%; 
                min-height: 320px; 
                box-sizing: border-box;
                padding: 24px 28px;
                background: var(--weather-bg, #000000);
                border-radius: 14px;
                box-shadow: 0 10px 30px rgba(200, 3, 255, 0.47);
                font-family: Arial, sans-serif;
                color: var(--weather-text, #f3f4f6);
                font-size: var(--weather-font-size, 16px);
                border: 1.5px solid var(--weather-accent, #9307f1);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            h2 {
                margin: 0 0 20px;
                font-size: 1.3rem;
                position: relative;
                z-index: 1;
            }

            h2::first-letter {
                font-size: 1.8em;
                color: var(--weather-accent, #9307f1);
            }

            .temp {
                font-size: 2.6rem;
                font-weight: 700;
                margin: 10px 0 18px;
                color: #cca6e4;
                position: relative;
                z-index: 1;
            }

            .details {
                margin-top: auto; 
            }

            .details p {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 14px;
                margin: 0 0 8px;
                background: #f6f4f7;
                border: 1.5px solid var(--weather-accent, #9307f1);
                border-radius: 9px;
                color: #000000;
                font-weight: 500;
            }

            .details p:last-child {
                margin-bottom: 0;
            }

            .details p span {
                font-weight: 700;
                color: #000000;
            }

            .card:hover {
                box-shadow: 0 14px 40px rgba(207, 60, 252, 0.7);
                transition: box-shadow 0.25s;
            }

            ::selection {
                background: var(--weather-accent, #9307f1);
                color: #fff;
            }
        </style>

        <div class="card">
            <h2>${this.city}</h2>
            <div class="temp">${data.temp}</div>
            <div class="details">
                <p>Условия <span>${data.condition}</span></p>
                <p>Влажность <span>${data.humidity}</span></p>
                <p>Ветер <span>${data.wind}</span></p>
            </div>
        </div>
        `;
    }
}

customElements.define('weather-widget', WeatherWidget);