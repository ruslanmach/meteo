document.addEventListener('DOMContentLoaded', () => {
    const temp1 = document.querySelector('.t1');
    const temp2 = document.querySelector('.t2');
    const temp3 = document.querySelector('.t3');

    async function fetchTemperature() {
        try {
            const response = await fetch('/temperature');
            const data = await response.json();

            temp1.textContent = data.T1 !== null ? `${data.T1}°C` : '—';
            temp2.textContent = data.T2 !== null ? `${data.T2}°C` : '—';
            temp3.textContent = data.T3 !== null ? `${data.T3}°C` : '—';
        } catch (error) {
            console.error('Помилка отримання температури:', error);
        }
    }

    fetchTemperature();
    setInterval(fetchTemperature, 5000);
});
