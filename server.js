import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;


// Отримуємо шлях до поточного файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфігурація
const ESP_IP = 'meteoesp.hopto.org'; // Домен No-IP
const API_TIMEOUT = 10000; // Збільшений таймаут до 10 секунд

// Middleware
app.use(express.static(__dirname));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Для обробки CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Обробник для реле
const handleRelayRequest = async (endpoint, res) => {
    try {
        console.log(`🔄 Запит до ESP: ${endpoint}`);

        // Використовуємо AbortController для контролю таймауту
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(`http://${ESP_IP}${endpoint}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`ESP error: ${response.status} ${response.statusText}`);
            return res.status(502).json({ error: 'Помилка ESP' });
        }

        res.sendStatus(200); // Якщо запит успішний, відправляємо статус 200
    } catch (error) {
        console.error(`Помилка з'єднання: ${error.message}`);
        res.status(504).json({ error: 'ESP недоступний або таймаут' });
    }
};

// Маршрути для включення та вимикання реле
app.get('/relay/on', (req, res) => handleRelayRequest('/relay/on', res));
app.get('/relay/off', (req, res) => handleRelayRequest('/relay/off', res));

// Маршрут для отримання стану реле
app.get('/state', async (req, res) => {
    try {
        console.log("🔄 Запит до ESP для отримання стану реле");

        // Використовуємо AbortController для контролю таймауту
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        const response = await fetch(`http://${ESP_IP}/state`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Невірний статус від ESP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📡 Стан реле отримано:", data);
        res.json(data); // Відправляємо стан реле клієнту
    } catch (error) {
        console.error(`Помилка при отриманні стану реле: ${error.message}`);
        res.status(500).json({ error: 'Помилка сервера або ESP недоступний' });
    }
});

// Обробка 404 (не знайдено)
app.use((req, res) => {
    res.status(404).send('Сторінку не знайдено');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
    console.log(`IP ESP: ${ESP_IP}`);
});

