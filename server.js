import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(__dirname)); // Віддає файли з поточної директорії

const mqttBroker = 'mqtt://broker.emqx.io'; // Оновлений MQTT брокер
const mqttClient = mqtt.connect(mqttBroker, {
    keepalive: 60,
    reconnectPeriod: 5000, // Автоматичне підключення кожні 5 секунд
});

const tempTopic = 'esp/temperature';
const resetTopic = 'esp/reset';
let latestTemperature = { T1: 0, T2: 0, T3: 0 };

mqttClient.on('connect', () => {
    console.log('Підключено до MQTT брокера');
    mqttClient.subscribe(tempTopic);
});

mqttClient.on('message', (topic, message) => {
    if (topic === tempTopic) {
        try {
            latestTemperature = JSON.parse(message.toString());
            console.log(`Отримано температуру:`, latestTemperature);
        } catch (error) {
            console.error('Помилка парсингу JSON:', error);
        }
    }
});

app.get('/temperature', (req, res) => {
    res.json(latestTemperature);
});

app.get('/reset', (req, res) => {
    console.log("Запит на скидання Wi-Fi!");
    mqttClient.publish(resetTopic, 'RESET');
    res.send("Скидання виконано!");
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
let mqttStatus = 'Offline';  // Статус підключення

mqttClient.on('connect', () => {
    console.log('Підключено до MQTT брокера');
    mqttStatus = 'Online';  // Плата онлайн
    mqttClient.subscribe(tempTopic);
});

mqttClient.on('error', () => {
    console.log('Помилка підключення до MQTT брокера');
    mqttStatus = 'Offline';  // Плата офлайн
});

app.get('/status', (req, res) => {
    res.json({ status: mqttStatus });  // Надсилаємо статус
});

