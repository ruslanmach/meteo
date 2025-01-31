import express from 'express';
import mqtt from 'mqtt';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Отримуємо шлях до поточного файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Підключення до MQTT брокера
const mqttBroker = 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(mqttBroker);

const relayTopic = 'esp/relay';
const stateTopic = 'esp/relay/state';

let relayState = '0'; // Стартовий стан реле (вимкнено)

mqttClient.on('connect', () => {
    console.log('Підключено до MQTT брокера');
    mqttClient.subscribe(stateTopic);
});

mqttClient.on('message', (topic, message) => {
    if (topic === stateTopic) {
        relayState = message.toString();
        console.log(`Стан реле: ${relayState}`);
    }
});

// Middleware для статичних файлів
app.use(express.static(__dirname));

// Включення реле
app.get('/relay/on', (req, res) => {
    mqttClient.publish(relayTopic, 'on');
    relayState = '1'; // Реле увімкнено
    console.log('Реле увімкнено');
    res.send({ success: true, message: 'Реле увімкнено' });
});

// Вимкнення реле
app.get('/relay/off', (req, res) => {
    mqttClient.publish(relayTopic, 'off');
    relayState = '0'; // Реле вимкнено
    console.log('Реле вимкнено');
    res.send({ success: true, message: 'Реле вимкнено' });
});

// Запит стану реле
app.get('/state', (req, res) => {
    res.json({ relayState });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
