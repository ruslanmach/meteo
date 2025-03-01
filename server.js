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

const mqttBroker = 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(mqttBroker);

const tempTopic = 'esp/temperature';
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

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
