document.addEventListener('DOMContentLoaded', function () {
    const relayButtonOn = document.querySelector('.button_on');
    const relayButtonOff = document.querySelector('.button_off');
    const statusText = document.querySelector('.text_status_relay');
    const statusColor = document.querySelector('.rectangle_color_status');
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=popeli&units=metric&appid=";
    const apiKey = "56453dff84f2d81f438002ab827f8cc5";
    const tempOutside = document.querySelector('.temp_text_outside');
    // Автовизначення адреси сервера
    const serverIp = window.location.origin;

    // Функція для оновлення статусу
    function updateUI(isOn) {
        statusText.textContent = isOn ? 'Увімкнено' : 'Вимкнено';
        statusColor.style.backgroundColor = isOn ? '#4CAF50' : '#f44336';
        console.log(`Статус оновлено: ${isOn ? 'Увімкнено' : 'Вимкнено'}`);
    }

    function imageReplaceF(weatherF) {
       const imgElement = document.querySelector('.img_out');
        if (weatherF === "clear") {
            imgElement.src = "img/clear.png";
        } else if (weatherF === "rain") {
            imgElement.src = "img/rain.png";
        } else if (weatherF === "clouds") {
            imgElement.src = "img/cloud.png";
        } else if (weatherF === "snow") {
            imgElement.src = "img/snow.png";
        } else if (weatherF === "mist" || weatherF === "drizzle") {
            imgElement.src = "img/mist.png";
        }
    }

    async function getWeather()  {
        try{
            const response = await fetch(apiUrl + apiKey);
            const data = await response.json();
            console.log(Math.round(data.main.temp))
            tempOutside.innerText = Math.round(data.main.temp) + "°С";
            imageReplaceF(data.weather[0].main.toLowerCase())
        } catch (error){
            console.log(error)
        }
    }
    getWeather();

    // Фу
    //нкція для отримання статусу
    async function fetchRelayState() {
        try {
            const response = await fetch(`${serverIp}/state`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            updateUI(data.relayState === '1');
            return data.relayState;
        } catch (error) {
            console.error('Помилка отримання статусу:', error);
            statusText.textContent = 'Помилка з\'єднання';
            statusColor.style.backgroundColor = '#ff9800';
        }
    }

    // Обробник для кнопок
    async function handleRelayAction(action) {
        try {
            const response = await fetch(`${serverIp}/relay/${action}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Помилка сервера: ${response.status}`);
            }

            // Оновлюємо статус після успішної дії
            await fetchRelayState();

        } catch (error) {
            console.error(`Помилка при ${action}:`, error);
            alert(`Не вдалося виконати дію: ${error.message}`);
        }
    }

    // Додаємо обробники подій
    relayButtonOn.addEventListener('click', () => handleRelayAction('on'));
    relayButtonOff.addEventListener('click', () => handleRelayAction('off'));

    // Первісне оновлення статусу (тільки один запит при завантаженні сторінки)
    fetchRelayState();

    // Автоматичне оновлення статусу кожні 5 секунд
    setInterval(fetchRelayState, 5000);

    // Обробка помилок мережі
    window.addEventListener('offline', () => {
        statusText.textContent = 'Офлайн';
        statusColor.style.backgroundColor = '#9e9e9e';
    });

    window.addEventListener('online', fetchRelayState);
});
