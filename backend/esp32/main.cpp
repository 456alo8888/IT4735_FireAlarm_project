#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <Arduino_JSON.h>
#include <WiFiClient.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <freertos/semphr.h>
 
// ================= MODE =================
enum ControlMode { AUTO, MANUAL };
 
// ================= PIN ==================
#define FLAME_DO_PIN 21  
#define FLAME_AO_PIN 33
#define GAS_DO_PIN 16
#define GAS_AO_PIN 35
#define BUZZER_PIN 23
#define VALVE_PIN 18 
// ================= THRESHOLDS =================
// Flame sensor: Giá trị THẤP = Phát hiện hồng ngoại (có lửa)
#define FLAME_THRESHOLD 2000  // Dưới 2000 = CÓ LỬA
// Gas sensor: Giá trị CAO = Nồng độ gas cao (rò rỉ)
#define GAS_THRESHOLD 2500    // Trên 2500 = CÓ GAS
// Hysteresis để tránh dao động
#define HYSTERESIS 200

// ================= DEVICE ID =================
#define DEVICE_ID "esp32_01"
 
// ================= WIFI =================
const char* ssid = ""; //TODO
const char* password = ""; //TODO 
 
// ================= MQTT =================
const char* mqtt_broker = "192.168.137.1"; //TODO
const int mqtt_port = 1883; 
 
const char* topic_publish_flame = "fire_alarm/esp32_01/sensor/flame";
const char* topic_publish_gas   = "fire_alarm/esp32_01/sensor/gas";
const char* topic_publish_state = "fire_alarm/esp32_01/sensor/state";
const char* topic_subscribe_buzzer = "fire_alarm/esp32_01/control/buzzer";
const char* topic_subscribe_valve  = "fire_alarm/esp32_01/control/valve";
 
const long LOOP_TIME = 1000;
 
// ================= GLOBAL =================
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
 
long previous_time = 0;
bool buzzerState = LOW;
bool valveState = LOW;
 
ControlMode currentMode = AUTO;
unsigned long manualModeStartTime = 0;
const unsigned long MANUAL_MODE_DURATION = 10000; // 10 giây
 
SemaphoreHandle_t modeMutex;
SemaphoreHandle_t stateMutex;
 
// ================= WIFI CONNECT =================
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
 
  Serial.print("Connecting to WiFi");
  unsigned long start = millis();
 
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
 
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi FAILED");
  }
}
 
// ================= MQTT CALLBACK =================
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
 
  Serial.println("📩 Topic: " + String(topic) + " | Message: " + message);
 
  if (String(topic) == topic_subscribe_buzzer) {
    if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
      buzzerState = (message == "ON");
      digitalWrite(BUZZER_PIN, buzzerState);
      xSemaphoreGive(stateMutex);
    }
    
    // Chuyển sang MANUAL và set timer 10 giây
    if (xSemaphoreTake(modeMutex, portMAX_DELAY)) {
      currentMode = MANUAL;
      manualModeStartTime = millis();
      Serial.println("🔧 Chuyển sang MANUAL mode (10 giây)");
      xSemaphoreGive(modeMutex);
    }
    
    // 📤 PUBLISH STATE NGAY LẬP TỨC
    if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
      JSONVar state_doc;
      state_doc["device_id"] = DEVICE_ID;
      state_doc["timestamp"] = millis() / 1000;
      state_doc["BUZZER_State"] = buzzerState;
      state_doc["VALVE_State"] = valveState;
      String state_msg = JSON.stringify(state_doc);
      mqttClient.publish(topic_publish_state, state_msg.c_str());
      Serial.println("📡 STATE (Buzzer): " + state_msg);
      xSemaphoreGive(stateMutex);
    }
  }
 
  if (String(topic) == topic_subscribe_valve) {
    if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
      valveState = (message == "ON");
      digitalWrite(VALVE_PIN, valveState);
      xSemaphoreGive(stateMutex);
    }
    
    // Chuyển sang MANUAL và set timer 10 giây
    if (xSemaphoreTake(modeMutex, portMAX_DELAY)) {
      currentMode = MANUAL;
      manualModeStartTime = millis();
      Serial.println("🔧 Chuyển sang MANUAL mode (10 giây)");
      xSemaphoreGive(modeMutex);
    }
    
    // 📤 PUBLISH STATE NGAY LẬP TỨC
    if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
      JSONVar state_doc;
      state_doc["device_id"] = DEVICE_ID;
      state_doc["timestamp"] = millis() / 1000;
      state_doc["BUZZER_State"] = buzzerState;
      state_doc["VALVE_State"] = valveState;
      String state_msg = JSON.stringify(state_doc);
      mqttClient.publish(topic_publish_state, state_msg.c_str());
      Serial.println("📡 STATE (Valve): " + state_msg);
      xSemaphoreGive(stateMutex);
    }
  }
}
 
// ================= MQTT =================
void setupMQTT() {
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
}
 
void reconnect() {
  if (WiFi.status() != WL_CONNECTED) return;
 
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "ESP32-";
    clientId += String(random(0xffff), HEX);
 
    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("✅ connected");
      mqttClient.subscribe(topic_subscribe_buzzer);
      mqttClient.subscribe(topic_subscribe_valve);
    } else {
      Serial.print("❌ failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retry in 2s");
      delay(2000);
    }
  }
}
 
// ================= FREERTOS TASKS =================
// Task 1: Đọc cảm biến
void sensorTask(void* parameter) {
  for (;;) {
    int flame_state = digitalRead(FLAME_DO_PIN);
    int infrared_value = analogRead(FLAME_AO_PIN);
    int gas_state = digitalRead(GAS_DO_PIN);
    int gas_value = analogRead(GAS_AO_PIN);
    
    // Lưu vào biến global (có thể dùng queue nếu cần)
    // Publish MQTT
    if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
      unsigned long timestamp = millis() / 1000; // Giây kể từ khi khởi động
      
      JSONVar flame_doc;
      flame_doc["device_id"] = DEVICE_ID;
      flame_doc["timestamp"] = timestamp;
      flame_doc["DO_State"] = flame_state;
      flame_doc["AO_Value"] = infrared_value;
      String flame_msg = JSON.stringify(flame_doc);
      mqttClient.publish(topic_publish_flame, flame_msg.c_str());
      Serial.println("🔥 FLAME: " + flame_msg);
 
      JSONVar gas_doc;
      gas_doc["device_id"] = DEVICE_ID;
      gas_doc["timestamp"] = timestamp;
      gas_doc["DO_State"] = gas_state;
      gas_doc["AO_Value"] = gas_value;
      String gas_msg = JSON.stringify(gas_doc);
      mqttClient.publish(topic_publish_gas, gas_msg.c_str());
      Serial.println("☣️ GAS: " + gas_msg);
      
      // Publish state
      if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
        JSONVar state_doc;
        state_doc["device_id"] = DEVICE_ID;
        state_doc["timestamp"] = timestamp;
        state_doc["BUZZER_State"] = buzzerState;
        state_doc["VALVE_State"] = valveState;
        String state_msg = JSON.stringify(state_doc);
        mqttClient.publish(topic_publish_state, state_msg.c_str());
        Serial.println("📡 STATE: " + state_msg);
        xSemaphoreGive(stateMutex);
      }
      
      Serial.println("-----------------------------------");
    }
    
    // Kiểm tra AUTO mode logic
    if (xSemaphoreTake(modeMutex, portMAX_DELAY)) {
      if (currentMode == AUTO) {
        // Logic kiểm tra: Digital PIN HOẶC Analog Threshold
        bool flameDetected = (flame_state == LOW) || (infrared_value < FLAME_THRESHOLD);
        bool gasDetected = (gas_state == LOW) || (gas_value > GAS_THRESHOLD);
        
        if (flameDetected || gasDetected) {
          if (flameDetected) {
            Serial.print("🔥 AUTO: Phát hiện LỬA - DO:");
            Serial.print(flame_state == LOW ? "YES" : "NO");
            Serial.print(" AO:");
            Serial.println(infrared_value);
          }
          if (gasDetected) {
            Serial.print("☣️ AUTO: Phát hiện GAS - DO:");
            Serial.print(gas_state == LOW ? "YES" : "NO");
            Serial.print(" AO:");
            Serial.println(gas_value);
          }
          
          if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
            buzzerState = HIGH;
            valveState = HIGH;
            digitalWrite(BUZZER_PIN, buzzerState);
            digitalWrite(VALVE_PIN, valveState);
            xSemaphoreGive(stateMutex);
          }
        } else {
          // An toàn: tắt còi/van (chỉ khi AUTO)
          if (xSemaphoreTake(stateMutex, portMAX_DELAY)) {
            if (buzzerState == HIGH || valveState == HIGH) {
              Serial.println("✅ AUTO: Môi trường an toàn - TẮT còi/van");
              buzzerState = LOW;
              valveState = LOW;
              digitalWrite(BUZZER_PIN, buzzerState);
              digitalWrite(VALVE_PIN, valveState);
            }
            xSemaphoreGive(stateMutex);
          }
        }
      }
      xSemaphoreGive(modeMutex);
    }
    
    vTaskDelay(1000 / portTICK_PERIOD_MS); // 1 giây
  }
}
 
// Task 2: Quản lý Mode Timer
void modeTimerTask(void* parameter) {
  for (;;) {
    if (xSemaphoreTake(modeMutex, portMAX_DELAY)) {
      if (currentMode == MANUAL) {
        unsigned long elapsed = millis() - manualModeStartTime;
        if (elapsed >= MANUAL_MODE_DURATION) {
          currentMode = AUTO;
          Serial.println("⚙️ Tự động quay về AUTO mode");
        }
      }
      xSemaphoreGive(modeMutex);
    }
    vTaskDelay(500 / portTICK_PERIOD_MS); // Check mỗi 0.5 giây
  }
}
 
// Task 3: MQTT Connection
void mqttTask(void* parameter) {
  for (;;) {
    mqttClient.loop();
    
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🔄 Reconnecting WiFi...");
      connectWiFi();
    }
    
    if (!mqttClient.connected()) {
      reconnect();
    }
    
    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}
 
// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  analogSetAttenuation(ADC_11db);
 
  pinMode(FLAME_DO_PIN, INPUT);
  pinMode(GAS_DO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(VALVE_PIN, OUTPUT);
 
  connectWiFi();
  setupMQTT();
  
  // Tạo Semaphores
  modeMutex = xSemaphoreCreateMutex();
  stateMutex = xSemaphoreCreateMutex();
  
  // Tạo FreeRTOS Tasks
  xTaskCreatePinnedToCore(
    sensorTask,       // Task function
    "SensorTask",     // Task name
    4096,             // Stack size
    NULL,             // Parameters
    1,                // Priority
    NULL,             // Task handle
    1                 // Core 1
  );
  
  xTaskCreatePinnedToCore(
    modeTimerTask,
    "ModeTimer",
    2048,
    NULL,
    1,
    NULL,
    1
  );
  
  xTaskCreatePinnedToCore(
    mqttTask,
    "MQTTTask",
    4096,
    NULL,
    2,                // Priority cao hơn
    NULL,
    0                 // Core 0
  );
  
  Serial.println("✅ FreeRTOS Tasks started");
}
 
// ================= LOOP =================
void loop() {
  // Loop() giờ trống vì tất cả logic đã chuyển sang FreeRTOS tasks
  vTaskDelay(1000 / portTICK_PERIOD_MS);
}