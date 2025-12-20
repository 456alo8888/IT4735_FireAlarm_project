// backend.js
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const MQTT_BROKER = process.env.MQTT_BROKER || "localhost";
const MQTT_PORT = Number(process.env.MQTT_PORT || 1883);
const MQTT_USERNAME = process.env.MQTT_USERNAME || "hieupc";
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || "hieupc123";

const TOPIC_PUBLISH_FLAME = process.env.TOPIC_PUBLISH_FLAME || "esp32/flame_sensor";
const TOPIC_PUBLISH_GAS = process.env.TOPIC_PUBLISH_GAS || "esp32/gas_sensor";
const TOPIC_COMMAND_BASE = process.env.TOPIC_COMMAND_BASE || "esp32/command";

let mqttClient;

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

    mqttClient = mqtt.connect({
        host: MQTT_BROKER,
        port: MQTT_PORT,
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        protocol: 'mqtt'
    });

    mqttClient.on('connect', () => {
        console.log('✅ Connected to MQTT broker');

        mqttClient.subscribe(TOPIC_PUBLISH_FLAME);
        mqttClient.subscribe(TOPIC_PUBLISH_GAS);
    });

    mqttClient.on('reconnect', () => {
        console.log('🔄 Reconnecting to MQTT broker...');
    });

    mqttClient.on('close', () => {
        console.log('⚠️ MQTT connection closed');
    });

    mqttClient.on('error', (err) => {
        console.error('❌ MQTT error:', err.message);
    });

    mqttClient.on('message', async (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            data.timestamp = new Date();
            data.topic = topic;

            let targetCollection =
                topic === TOPIC_PUBLISH_FLAME ? flameCollection :
                topic === TOPIC_PUBLISH_GAS ? gasCollection :
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

app.post('/api/command', (req, res) => {
    const { deviceId, relay, buzzer } = req.body || {};

    if (!deviceId || typeof deviceId !== 'string') {
        return res.status(400).json({ error: 'deviceId (string) is required' });
    }
    if (typeof relay !== 'boolean' && typeof buzzer !== 'boolean') {
        return res.status(400).json({ error: 'At least one of relay/buzzer (boolean) must be provided' });
    }

    if (!mqttClient || !mqttClient.connected) {
        return res.status(503).json({ error: 'MQTT client not connected' });
    }

    const topic = `${TOPIC_COMMAND_BASE}/${deviceId}`;
    const payload = {
        deviceId,
        relay,
        buzzer,
        ts: new Date().toISOString()
    };

    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1, retain: false }, (err) => {
        if (err) {
            console.error('❌ MQTT publish error:', err.message);
            return res.status(500).json({ error: 'Publish failed' });
        }
        return res.json({ ok: true, topic, payload });
    });
});


// ===== 5️⃣ Start Express =====
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});


// app.listen(3000, '0.0.0.0', () => {
//   console.log("Server running on port 3000");
// });
