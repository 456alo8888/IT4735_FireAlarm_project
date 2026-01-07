# 🔥 Fire Alarm System - Setup Instructions

This document provides step-by-step instructions for setting up and running the Fire Alarm IoT system on different laptops.

---

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (Community Edition)
- **Mosquitto MQTT Broker**
- **Arduino IDE** or **PlatformIO** (for ESP32 programming)

### Hardware
- ESP32 Development Board
- Flame Sensor (with DO and AO pins)
- Gas Sensor (with DO and AO pins)
- Buzzer
- Valve/Relay Module

---

## ⚙️ Configuration Steps

### 1. Network Configuration

#### 1.1 Find Your IP Address
First, determine your laptop's IP address that will act as the MQTT broker and backend server.

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

#### 1.2 Configure WiFi Hotspot (if needed)
If using your laptop as a hotspot:
- Windows: Settings → Network & Internet → Mobile hotspot
- Note down the network name (SSID) and password
- Note the IPv4 address (usually something like `192.168.137.1`)

---

### 2. ESP32 Configuration

Edit [`backend/esp32/main.cpp`](backend/esp32/main.cpp):

```cpp
// Line 26-27: WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";        // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// Line 30: MQTT Broker IP
const char* mqtt_broker = "192.168.1.100";  // Replace with your laptop's IP address
```

**Important Notes:**
- If using hotspot, the IP is typically `192.168.137.1` (Windows) or `192.168.43.1` (Android)
- If using router WiFi, use your laptop's IP from `ipconfig`/`ifconfig`
- Ensure ESP32 and laptop are on the same network

---

### 3. Backend Configuration

#### 3.1 Server Configuration

Edit [`backend/server.js`](backend/server.js):

```javascript
// Line 8: MQTT Broker Address
const MQTT_BROKER = process.env.MQTT_BROKER || "localhost";
```

**If running MQTT on different machine:**
- Change `"localhost"` to the IP address of the machine running Mosquitto

**MongoDB Connection (Line 30):**
```javascript
const mongoClient = new MongoClient('mongodb://localhost:27017');
```
- Keep as `localhost` if MongoDB runs on same machine
- Change to `mongodb://IP_ADDRESS:27017` if MongoDB is on different machine

**WebSocket Port (Line 50):**
```javascript
const wss = new WebSocket.Server({ port: 8080 });
```
- Default: `8080` - change if this port is already in use

#### 3.2 Telegram Bot Configuration

Edit [`backend/telebot/telebot.py`](backend/telebot/telebot.py):

```python
# Line 15-16: Telegram Bot Configuration
TELEGRAM_TOKEN = "YOUR_BOT_TOKEN_HERE"  # Get from @BotFather
AUTHORIZED_CHAT_ID = 123456789          # Get from @userinfobot

# Line 18-19: MQTT Broker Configuration
MQTT_BROKER = "localhost"  # Change to MQTT broker IP if needed
MQTT_PORT = 1883

# Line 20-21: MQTT Credentials (optional)
MQTT_USERNAME = "TODO"  # If authentication is enabled
MQTT_PASSWORD = "TODO"  # If authentication is enabled
```

**How to get Telegram credentials:**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow instructions to get `TELEGRAM_TOKEN`
3. Search for `@userinfobot` and send `/start` to get your `AUTHORIZED_CHAT_ID`

---

### 4. Frontend Configuration

Edit [`frontend/fire-alarm-dashboard/src/contexts/DeviceContext.tsx`](frontend/fire-alarm-dashboard/src/contexts/DeviceContext.tsx):

```typescript
// Line 81: WebSocket Connection
const ws = new WebSocket("ws://localhost:8080");
```

**If backend runs on different machine:**
- Change `localhost` to backend server's IP address
- Example: `ws://192.168.1.100:8080`

Also edit [`frontend/fire-alarm-dashboard/src/contexts/WebSocketContext.tsx`](frontend/fire-alarm-dashboard/src/contexts/WebSocketContext.tsx):

```typescript
// Line 10: WebSocket Connection
const ws = new WebSocket("ws://localhost:8080");
```

---

## 🚀 Running the System

### Step 1: Start MongoDB

**Windows:**
```powershell
# If MongoDB is installed as a service, it should start automatically
# Otherwise, run:
mongod --dbpath "C:\data\db"
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

### Step 2: Start MQTT Broker (Mosquitto)

**Windows:**
```powershell
# If installed as service
net start mosquitto

# Or run manually
mosquitto -v
```

**Linux/Mac:**
```bash
sudo systemctl start mosquitto
# or
mosquitto -v
```

### Step 3: Start Backend Server

Open terminal in project root:

```powershell
cd backend
npm install  # First time only
node server.js
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Connected to MQTT broker
Backend server listening on port 3000
```

### Step 4: Start Telegram Bot (Optional)

Open a new terminal:

```powershell
cd backend/telebot
pip install -r requirements.txt  # First time only
# or install manually:
pip install python-telegram-bot paho-mqtt

python telebot.py
```

**Expected Output:**
```
✅ MQTT connected
✅ Telegram Bot started
```

### Step 5: Start Frontend Dashboard

Open a new terminal:

```powershell
cd frontend/fire-alarm-dashboard
npm install  # First time only
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

Open browser and navigate to `http://localhost:5173`

### Step 6: Upload ESP32 Code

1. Open [`backend/esp32/main.cpp`](backend/esp32/main.cpp) in Arduino IDE or PlatformIO
2. Ensure configurations (WiFi, MQTT broker IP) are correct
3. Connect ESP32 via USB
4. Select correct board and port
5. Upload the code

**Expected Serial Monitor Output:**
```
Connecting to WiFi....
✅ WiFi connected
IP: 192.168.1.101
✅ connected to MQTT broker
✅ FreeRTOS Tasks started
```

---

## 🔍 Verification Checklist

- [ ] MongoDB is running (check with `mongo` command or MongoDB Compass)
- [ ] Mosquitto is running (check with `netstat -an | findstr 1883` on Windows)
- [ ] Backend server console shows "✅ Connected to MQTT broker"
- [ ] ESP32 serial monitor shows "✅ WiFi connected" and "✅ connected to MQTT broker"
- [ ] Frontend dashboard opens in browser at `http://localhost:5173`
- [ ] Dashboard displays real-time sensor data from ESP32
- [ ] Telegram bot responds to `/start` command (if configured)

---

## 🐛 Troubleshooting

### ESP32 cannot connect to WiFi
- Verify SSID and password are correct
- Ensure ESP32 is in range of WiFi network
- Check if WiFi uses 2.4GHz (ESP32 doesn't support 5GHz)

### ESP32 cannot connect to MQTT
- Verify `mqtt_broker` IP address is correct
- Ping the broker IP from another device to confirm network connectivity
- Check Mosquitto is running: `netstat -an | findstr 1883`
- Disable firewall temporarily to test

### Frontend cannot connect to backend
- Verify WebSocket URL in `DeviceContext.tsx` and `WebSocketContext.tsx`
- Check backend server is running on port 8080
- Open browser console (F12) to see WebSocket errors

### MongoDB connection failed
- Ensure MongoDB service is running
- Check if port 27017 is available: `netstat -an | findstr 27017`
- Verify database path exists and has proper permissions

### Telegram bot not responding
- Verify `TELEGRAM_TOKEN` is correct
- Check `AUTHORIZED_CHAT_ID` matches your Telegram user ID
- Ensure Python script is running without errors
- Check MQTT connection in bot console output

---

## 📱 Quick Start Commands Summary

```powershell
# Terminal 1: Start Backend
cd backend
node server.js

# Terminal 2: Start Telegram Bot (Optional)
cd backend/telebot
python telebot.py

# Terminal 3: Start Frontend
cd frontend/fire-alarm-dashboard
npm run dev
```

---

## 🌐 Network Configuration Examples

### Example 1: All on Same Laptop (Development)
- **MQTT Broker:** `localhost` or `127.0.0.1`
- **Backend:** `localhost`
- **Frontend WebSocket:** `ws://localhost:8080`
- **ESP32 MQTT Broker:** `192.168.1.100` (laptop's WiFi IP)

### Example 2: Using WiFi Hotspot
- **Laptop IP:** `192.168.137.1` (Windows hotspot)
- **ESP32 connects to:** Laptop's hotspot SSID
- **ESP32 MQTT Broker:** `192.168.137.1`
- **Backend MQTT:** `localhost`
- **Frontend WebSocket:** `ws://localhost:8080`

### Example 3: Router Network (Multiple Devices)
- **Laptop IP:** `192.168.1.100`
- **ESP32 IP:** `192.168.1.101`
- **MQTT Broker:** `192.168.1.100`
- **Backend:** `192.168.1.100`
- **Frontend (on another PC):** `ws://192.168.1.100:8080`

---

## 📝 Configuration Checklist for New Laptop

1. [ ] Update WiFi SSID and password in `main.cpp`
2. [ ] Update MQTT broker IP in `main.cpp`
3. [ ] Update backend WebSocket URL in `DeviceContext.tsx` (if needed)
4. [ ] Update backend WebSocket URL in `WebSocketContext.tsx` (if needed)
5. [ ] Update Telegram bot token and chat ID in `telebot.py` (if using bot)
6. [ ] Install all dependencies (`npm install`, `pip install`)
7. [ ] Ensure MongoDB and Mosquitto are running
8. [ ] Upload code to ESP32
9. [ ] Test connectivity and sensor data flow

---

## 🎯 Default Ports Reference

| Service | Port | Protocol |
|---------|------|----------|
| MQTT Broker | 1883 | TCP |
| Backend WebSocket | 8080 | WebSocket |
| Frontend Dev Server | 5173 | HTTP |
| MongoDB | 27017 | TCP |

---

**Last Updated:** January 2026  
**Project:** Fire Alarm IoT System  
**Course:** IT4735 - IoT (HUST)
