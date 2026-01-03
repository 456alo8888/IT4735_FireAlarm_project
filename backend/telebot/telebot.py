import logging
import asyncio
import html
import datetime
import paho.mqtt.client as mqtt
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, 
    ContextTypes, 
    CommandHandler, 
    MessageHandler,
    filters
)

# ==========================================
#              CONFIGURATION
# ==========================================
TELEGRAM_TOKEN = "" # Your Telegram Bot Token (from @BotFather)
AUTHORIZED_CHAT_ID = 123456789 # Your Telegram Chat ID (from @userinfobot)

MQTT_BROKER = "localhost" # Using local Mosquitto broker
MQTT_PORT = 1883
MQTT_USERNAME = "hieupc" # Your MQTT Username
MQTT_PASSWORD = "hieupc123" # Your MQTT Password

# 🔥 Updated topics to match backend & ESP32
TOPIC_SUBSCRIBE_FLAME = "fire_alarm/esp32_01/sensor/flame"
TOPIC_SUBSCRIBE_GAS = "fire_alarm/esp32_01/sensor/gas"
TOPIC_SUBSCRIBE_STATE = "fire_alarm/esp32_01/sensor/state"
TOPIC_CONTROL_BUZZER = "fire_alarm/esp32_01/control/buzzer"
TOPIC_CONTROL_VALVE = "fire_alarm/esp32_01/control/valve"

# ==========================================
#           LOGGING & GLOBAL VARS
# ==========================================
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

bot_app = None
main_loop = None 

# Store latest sensor data
latest_flame_data = None
latest_gas_data = None
latest_state_data = None

# Flag to check if user is waiting for status update
is_waiting_for_statusdata_dict, force_show=False):
    """
    Parse sensor data from JSON format:
    Flame: {"device_id": "esp32_01", "timestamp": 12345, "DO_State": 0, "AO_Value": 1500}
    Gas: {"device_id": "esp32_01", "timestamp": 12345, "DO_State": 1, "AO_Value": 2800}
    State: {"device_id": "esp32_01", "timestamp": 12345, "BUZZER_State": 1, "VALVE_State": 1}
    """
    try:
        # Determine device status based on flame and gas sensors
        flame_state = latest_flame_data.get('DO_State', 1) if latest_flame_data else 1
        gas_state = latest_gas_data.get('DO_State', 1) if latest_gas_data else 1
        
        # 0 = detected (danger), 1 = normal
        if flame_state == 0 and gas_state == 0:
            header = "🔥 <b>EMERGENCY ALARM</b> 🔥"
            status_text = "🔴 FIRE & GAS DETECTED! EVACUATE IMMEDIATELY!"
        elif flame_state == 0:
            header = "🔥 <b>FIRE WARNING</b>"
            status_text = "🟡 Flame detected! Check area immediately!"
        elif gas_state == 0:
            header = "💨 <b>GAS WARNING</b>"
            status_text = "🟡 Gas leak detected! Ventilate area!"
        else:
            # Normal state: Only show if requested manually
            if not force_show:
                logger.info("Status Normal. Ignored (Not a manual check).")
                return None
            header = "✅ <b>SYSTEM NORMAL</b>"
            status_text = "🛡 Area is safe. No hazards detected."

        # Get device states (boolean từ ESP32: true/false)
        buzzer_state = latest_state_data.get('BUZZER_State', False) if latest_state_data else False
        valve_state = latest_state_data.get('VALVE_State', False) if latest_state_data else False
        
        # Format sensor values
        flame_value = latest_flame_data.get('AO_Value', 'N/A') if latest_flame_data else 'N/A'
        gas_value = latest_gas_data.get('AO_Value', 'N/A') if latest_gas_data else 'N/A'

        # Build message
        msg = (
            f"{header}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"{status_text}\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📊 <b>Sensor Data:</b>\n"
            f"🔥 Flame: {'⚠️ DETECTED' if flame_state == 0 else '✅ Normal'} (Value: {flame_value})\n"
            f"💨 Gas: {'⚠️ DETECTED' if gas_state == 0 else '✅ Normal'} (Value: {gas_value})\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🚨 Buzzer: <b>{'🔊 ON' if buzzer_state == True else '🔇 OFF'}</b>\n"
            f"🚪 Valve: <b>{'🔓 OPEN' if valve_state == True else '🔒 CLOSED'}</b>\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"🕒 <i>{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>\n"
        )
        return msg

    except Exception as e:
        logger.error(f"Error parsing data: {e}")
        return None

# ==========================================
#           MQTT FUNCTIONS
# ==========================================
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        logger.info("✅ Connected to MQTT Broker!")
        client.subscribe(TOPIC_SUBSCRIBE_FLAME)
        client.subscribe(TOPIC_SUBSCRIBE_GAS)
        client.subscribe(TOPIC_SUBSCRIBE_STATE)
        logger.info(f"📡 Subscribed to: {TOPIC_SUBSCRIBE_FLAME}, {TOPIC_SUBSCRIBE_GAS}, {TOPIC_SUBSCRIBE_STATE}")
    else:
        logger.error(f"❌ Failed to connect to MQTT, return code {rc}")

def on_message(client, userdata, msg):
    global is_waiting_for_status, latest_flame_data, latest_gas_data, latest_state_data
    
    try:
        import json
        payload_str = msg.payload.decode().strip()
        topic = msg.topic
        
        logger.info(f"📨 Received from {topic}: {payload_str}")
        
        # Parse JSON payload
        data = json.loads(payload_str)
        
        # Store latest data
        if topic == TOPIC_SUBSCRIBE_FLAME:
            latest_flame_data = data
        elif topic == TOPIC_SUBSCRIBE_GAS:
            latest_gas_data = data
        elif topic == TOPIC_SUBSCRIBE_STATE:
            latest_state_data = data
        
        # Determine if we should send notification
        should_notify = False
        should_force = is_waiting_for_status
        
        # Auto-notify on alarm conditions (flame or gas detected)
        if topic in [TOPIC_SUBSCRIBE_FLAME, TOPIC_SUBSCRIBE_GAS]:
            do_state = data.get('DO_State', 1)
            if do_state == 0:  # 0 = detected (danger)
                should_not� Buzzer ON"), KeyboardButton("🔕 Buzzer OFF")],
        [KeyboardButton("🔓 Valve OPEN"), KeyboardButton("🔒 Valve CLOSE
                should_force = True
        
        # Send notification if needed or requested
                should_notify = True
                is_waiting_for_status = False
            
            text_msg = parse_and_format(data, force_show=should_force)
            
            if text_msg:
                asyncio.run_coroutine_threadsafe(
                    bot_app.bot.send_message(
                        chat_id=AUTHORIZED_CHAT_ID,
                        text=text_msg,
                        parse_mode="HTML"
                    ),
                    main_loop
                )
            (Updated to match ESP32 format) ---
    # --- CONTROL COMMANDS == "🔔 Buzzer ON": 
        # Send "ON" to buzzer topic
        mqtt_client.publish(TOPIC_CONTROL_BUZZER, "ON")
        await update.message.reply_text("✅ Command sent: Buzzer ON")
        logger.info(f"📤 Published to {TOPIC_CONTROL_BUZZER}: ON")
        
    elif text == "🔕 Buzzer OFF":
        # Send "OFF" to buzzer topic
        mqtt_client.publish(TOPIC_CONTROL_BUZZER, "OFF")
        await update.message.reply_text("✅ Command sent: Buzzer OFF")
        logger.info(f"📤 Published to {TOPIC_CONTROL_BUZZER}: OFF")
        
    elif text == "🔓 Valve OPEN": 
        # Send "ON" to valve topic (ON = OPEN)
        mqtt_client.publish(TOPIC_CONTROL_VALVE, "ON")
        await update.message.reply_text("✅ Command sent: Valve OPEN")
        logger.info(f"📤 Published to {TOPIC_CONTROL_VALVE}: ON")
        
    elif text == "🔒 Valve CLOSE":
        # Send "OFF" to valve topic (OFF = CLOSE)
        mqtt_client.publish(TOPIC_CONTROL_VALVE, "OFF")
        await update.message.reply_text("✅ Command sent: Valve CLOSE")
        logger.info(f"📤 Published to {TOPIC_CONTROL_VALVE}: OFF")
        
    elif text == "🔄 Check Status":
        is_waiting_for_status = True
        # Request will be fulfilled by next sensor message
        await update.message.reply_text("⏳ Fetching latest data from device...")
        
        # Force send current status
        if latest_flame_data or latest_gas_data or latest_state_data:
            text_msg = parse_and_format({}, force_show=True)
            if text_msg:
                await update.message.reply_text(text_msg, parse_mode="HTML")
                is_waiting_for_status = False
        else:
            await update.message.reply_text("⚠️ No data received yet. Waiting for sensor updates...")
    
    else:
        await update.message.reply_text("❓ Unknown command. Use buttons below.")

def get_fire_keyboard():
    """Create custom keyboard for fire alarm control"""

    if text == "🚰 Toggle Valve": 
        # Send "1 0": Toggle Valve (1), Keep Siren (0)
        mqtt_client.publish(TOPIC_PUBLISH, "1 0")
        await update.message.reply_text("✅ Command sent: Toggle Water Valve (1 0)")
        
    elif text == "🔔 Toggle Siren":
        # Send "0 1": Keep Valve (0), Toggle Siren (1)
        mqtt_client.publish(TOPIC_PUBLISH, "0 1")
        await update.message.reply_text("✅ Command sent: Toggle Siren (0 1)")
        
    elif text == "🔄 Check Status":
        is_waiting_for_status = True
        # Send "CHECK_STATUS" to request data update
        mqtt_client.publish(TOPIC_PUBLISH, "CHECK_STATUS")
        await update.message.reply_text("⏳ Fetching latest data from device...")

# ==========================================
#              MAIN EXECUTION
# ==========================================
if __name__ == '__main__':
    try:
        main_loop = asyncio.get_event_loop()
    except RuntimeError:
        main_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(main_loop)

    mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message
    if MQTT_USERNAME and MQTT_PASSWORD:
        mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    
    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
    except Exception as e:
        logger.error(f"MQTT Error: {e}")
        exit(1)

    bot_app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    bot_app.add_handler(CommandHandler('start', start))
    bot_app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_commands))
    
    logger.info("🔥 Fire Alarm Bot is running...")
    bot_app.run_polling(allowed_updates=Update.ALL_TYPES)