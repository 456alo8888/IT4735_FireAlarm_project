// backend.js
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const MQTT_BROKER = "localhost";
const MQTT_PORT = 1883;
// const MQTT_USERNAME = "khanglt0004";
// const MQTT_PASSWORD = "Khang123456";


topic_publish_flame = "esp32/flame_sensor";
topic_publish_gas = "esp32/gas_sensor";

const app = express();
app.use(cors());
app.use(express.json());

// ===== 1️⃣ Connect MongoDB =====
const mongoClient = new MongoClient('mongodb://localhost:27017');
let flameCollection;
let gasCollection;

async function connectDB() {
    await mongoClient.connect();

    const flameDB = mongoClient.db('flame_sensor_db');
    const gasDB = mongoClient.db('gas_sensor_db');

    flameCollection = flameDB.collection('flame_data');
    gasCollection = gasDB.collection('gas_data');

    console.log('✅ Connected to MongoDB');
}

// ===== 2️⃣ WebSocket =====
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
    console.log('✅ WebSocket client connected');
});

// ===== 3️⃣ Start MQTT AFTER DB ready =====
async function startMQTT() {
    await connectDB(); // ensure DB fully initialized

    const client = mqtt.connect({
        host: MQTT_BROKER,
        port: MQTT_PORT,
        // username: MQTT_USERNAME,
        // password: MQTT_PASSWORD,
        protocol: 'mqtt'
    });

    client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');

        client.subscribe(topic_publish_flame);
        client.subscribe(topic_publish_gas);
    });


    client.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            data.timestamp = new Date();
            data.topic = topic;

            let targetCollection =
                topic === "esp32/flame_sensor" ? flameCollection :
                topic === "esp32/gas_sensor" ? gasCollection :
                null;

            if (!targetCollection) return;

            await targetCollection.insertOne(data);
            console.log(`📥 Stored in DB (${topic}):`, data);

            wss.clients.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN)
                    ws.send(JSON.stringify(data));
            });

        } catch (err) {
            console.error("❌ Error handling MQTT message:", err.message);
        }
    });
}

startMQTT();

// ===== 4️⃣ Express API =====
app.get('/api/latest', async (req, res) => {
    const flame = await flameCollection.find().sort({_id:-1}).limit(1).toArray();
    const gas = await gasCollection.find().sort({_id:-1}).limit(1).toArray();
    res.json({ flame: flame[0] || null, gas: gas[0] || null });
});


// ===== 5️⃣ Start Express =====
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});


// app.listen(3000, '0.0.0.0', () => {
//   console.log("Server running on port 3000");
// });
