// backend.js
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const MQTT_BROKER = process.env.MQTT_BROKER || "localhost";
const MQTT_PORT = Number(process.env.MQTT_PORT || 1883);
// const MQTT_USERNAME = process.env.MQTT_USERNAME || "TODO";
// const MQTT_PASSWORD = process.env.MQTT_PASSWORD || "TODO";

// const TOPIC_PUBLISH_FLAME = process.env.TOPIC_PUBLISH_FLAME || "esp32/flame_sensor";
// const TOPIC_PUBLISH_GAS = process.env.TOPIC_PUBLISH_GAS || "esp32/gas_sensor";
// const TOPIC_COMMAND_BASE = process.env.TOPIC_COMMAND_BASE || "esp32/command";


const TOPIC_PUBLISH_FLAME = "fire_alarm/esp32_01/sensor/flame";
const TOPIC_PUBLISH_GAS  = "fire_alarm/esp32_01/sensor/gas";
const TOPIC_PUBLISH_STATE = "fire_alarm/esp32_01/sensor/state";
const TOPIC_SUBCRIBE_BUZZER = "fire_alarm/esp32_01/control/buzzer";
const TOPIC_SUBCRIBE_VALVE = "fire_alarm/esp32_01/control/valve";
 

let mqttClient;

const app = express();
app.use(cors());
app.use(express.json());

// ===== 1️⃣ Connect MongoDB =====
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
let flameCollection;
let gasCollection;
let stateCollection;

async function connectDB() {
    await mongoClient.connect();

    const flameDB = mongoClient.db('flame_sensor_db');
    const gasDB = mongoClient.db('gas_sensor_db');
    const stateDB = mongoClient.db('state_sensor_db');

    flameCollection = flameDB.collection('flame_data');
    gasCollection = gasDB.collection('gas_data');
    stateCollection = stateDB.collection('state_data');

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
        // username: MQTT_USERNAME,  // ❌ Comment out if Mosquitto allows anonymous
        // password: MQTT_PASSWORD,
        protocol: 'mqtt'
    });

    mqttClient.on('connect', () => {
        console.log('✅ Connected to MQTT broker');

        mqttClient.subscribe(TOPIC_PUBLISH_FLAME);
        mqttClient.subscribe(TOPIC_PUBLISH_GAS);
        mqttClient.subscribe(TOPIC_PUBLISH_STATE);
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
            // ESP32 gửi: { device_id, timestamp, ... }
            // Thêm dateTime từ server
            data.dateTime = new Date();
            data.topic = topic;

            let targetCollection =
                topic === TOPIC_PUBLISH_FLAME ? flameCollection :
                topic === TOPIC_PUBLISH_GAS ? gasCollection :
                topic === TOPIC_PUBLISH_STATE ? stateCollection :
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
    const state = await stateCollection.find().sort({_id:-1}).limit(1).toArray();
    res.json({ 
        flame: flame[0] || null, 
        gas: gas[0] || null,
        state: state[0] || null
    });
});

app.post('/api/command', (req, res) => {
    console.log('🔵 Received command request:', req.body);
    
    const { deviceId, relay, buzzer } = req.body || {};

    if (!deviceId || typeof deviceId !== 'string') {
        console.log('❌ Invalid deviceId:', deviceId);
        return res.status(400).json({ error: 'deviceId (string) is required' });
    }
    if (typeof relay !== 'boolean' && typeof buzzer !== 'boolean') {
        console.log('❌ Invalid relay/buzzer values:', { relay, buzzer });
        return res.status(400).json({ error: 'At least one of relay/buzzer (boolean) must be provided' });
    }

    console.log('🔌 MQTT Client Status:', {
        exists: !!mqttClient,
        connected: mqttClient?.connected,
        reconnecting: mqttClient?.reconnecting
    });

    if (!mqttClient || !mqttClient.connected) {
        console.log('❌ MQTT client not connected!');
        return res.status(503).json({ error: 'MQTT client not connected' });
    }

    const results = [];

    // 🔔 Điều khiển BUZZER
    if (typeof buzzer === 'boolean') {
        const payload = buzzer ? "ON" : "OFF";
        mqttClient.publish(TOPIC_SUBCRIBE_BUZZER, payload, { qos: 1, retain: false }, (err) => {
            if (err) {
                console.error('❌ MQTT publish error (buzzer):', err.message);
            } else {
                console.log(`📤 Published to ${TOPIC_SUBCRIBE_BUZZER}: ${payload}`);
            }
        });
        results.push({ device: 'buzzer', topic: TOPIC_SUBCRIBE_BUZZER, command: payload });
    }

    // 🚪 Điều khiển VALVE
    if (typeof relay === 'boolean') {
        const payload = relay ? "ON" : "OFF";
        mqttClient.publish(TOPIC_SUBCRIBE_VALVE, payload, { qos: 1, retain: false }, (err) => {
            if (err) {
                console.error('❌ MQTT publish error (valve):', err.message);
            } else {
                console.log(`📤 Published to ${TOPIC_SUBCRIBE_VALVE}: ${payload}`);
            }
        });
        results.push({ device: 'valve', topic: TOPIC_SUBCRIBE_VALVE, command: payload });
    }

    return res.json({ ok: true, deviceId, results });
});


// ===== 5️⃣ Start Express =====
const PORT = 3000;
// Don't specify host - let Node.js bind to all available interfaces
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - IPv4: http://127.0.0.1:${PORT}`);
});


// app.listen(3000, '0.0.0.0', () => {
//   console.log("Server running on port 3000");
// });
