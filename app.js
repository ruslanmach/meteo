document.addEventListener('DOMContentLoaded', () => {
    const temp1 = document.querySelector('.t1');
    const temp2 = document.querySelector('.t2');
    const temp3 = document.querySelector('.t3');
    const resetButton = document.querySelector('.button_header');
    const statusElement = document.getElementById('status');  // Статус елемент

    async function fetchTemperature() {
        try {
            const response = await fetch('/temperature');
            const data = await response.json();

            temp1.textContent = data.T1 !== null ? `${Math.round(data.T1)}°C` : '—';
            temp2.textContent = data.T2 !== null ? `${Math.round(data.T2)}°C` : '—';
            temp3.textContent = data.T3 !== null ? `${Math.round(data.T3)}°C` : '—';
        } catch (error) {
            console.error('Помилка отримання температури:', error);
        }
    }

    async function fetchStatus() {
        try {
            const response = await fetch('/status');
            const data = await response.json();
            statusElement.textContent = data.status;  // Оновлюємо статус
        } catch (error) {
            console.error('Помилка отримання статусу:', error);
        }
    }

    async function resetWiFi() {
        try {
            const response = await fetch('/reset');
            const message = await response.text();
            alert(message);
        } catch (error) {
            console.error('Помилка скидання Wi-Fi:', error);
        }
    }

    resetButton.addEventListener('click', resetWiFi);

    fetchTemperature();
    setInterval(fetchTemperature, 3000);
    setInterval(fetchStatus, 5000);  // Перевіряємо статус кожні 5 секунд
});
