// backend.js
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== 1️⃣ Connect MongoDB =====
const mongoClient = new MongoClient('mongodb://localhost:27017');
let collection;

async function connectDB() {
    await mongoClient.connect();
    const db = mongoClient.db('iot_demo');
    collection = db.collection('sensor');
    console.log('✅ Connected to MongoDB');
}
connectDB();

// ===== 2️⃣ Setup WebSocket server =====
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
    console.log('✅ WebSocket client connected');
});

// ===== 3️⃣ Connect MQTT =====


const MQTt_BROKER = "fb832bfab8614ad58aaf234a44bf02eb.s1.eu.hivemq.cloud";
const MQTT_PORT = 8883;
const MQTT_USERNAME = "khanglt0004";
const MQTT_PASSWORD = "Khang123456";

const options = {
    port: MQTT_PORT,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    protocol: 'mqtts'

}

const client = mqtt.connect(MQTt_BROKER , options);

client.on('connect', () => {
    console.log('✅ Connected to MQTT broker');

    client.subscribe("esp32/flame_sensor" , err =>{
        if(!err){
            console.log('✅ Subscribed to topic: esp32/flame_sensor');
        }else{
            console.error('❌ Subscription error:', err.message);
        }
    });

    client.subscribe("esp32/gas_sensor" , err => {
        if(!err){
            console.log('✅ Subscribed to topic: esp32/gas_sensor');
        }else{
            console.error('❌ Subscription error:', err.message);
        }
    });
});



client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        data.timestamp = new Date();
        data.topic = topic;
        data.topic = topic ; 


        // 3a. Lưu MongoDB
        await collection.insertOne(data);
        console.log(`📥 Data saved to (${topic}):`, data);

        // 3b. Gửi realtime qua WebSocket
        wss.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        });
    } catch (err) {
        console.error('Error parsing message:', err.message);
    }
});

// ===== 4️⃣ Express API =====
// Lấy dữ liệu mới nhất
app.get('/api/latest', async (req, res) => {
    const latest = await collection.find().sort({ _id: -1 }).limit(1).toArray();
    res.json(latest[0] || {});
});

// Lấy dữ liệu lịch sử (limit 20 bản ghi mới nhất)
app.get('/api/history', async (req, res) => {
    const history = await collection.find().sort({ _id: -1 }).limit(20).toArray();
    res.json(history.reverse()); // trả về theo thời gian tăng dần
});

// ===== 5️⃣ Start Express =====
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Express server running at http://localhost:${PORT}`);
});

console.log('Backend ready: MQTT → MongoDB → WebSocket → REST API');
