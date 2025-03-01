import express from 'express';
import mqtt from 'mqtt';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Підключення до MQTT брокера
const mqttBroker = 'mqtt://broker.hivemq.com';
const mqttClient = mqtt.connect(mqttBroker);

const tempTopic = 'esp/temperature';
let latestTemperature = { T1: null, T2: null, T3: null };

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

app.use(cors());

// Запит останніх даних температури
app.get('/temperature', (req, res) => {
    res.json(latestTemperature);
});

app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
