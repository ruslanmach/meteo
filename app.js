document.addEventListener('DOMContentLoaded', () => {
    const temp1 = document.querySelector('.t1');
    const temp2 = document.querySelector('.t2');
    const temp3 = document.querySelector('.t3');
    const resetButton = document.querySelector('.button_header');

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
});
