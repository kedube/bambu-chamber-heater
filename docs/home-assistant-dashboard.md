# Home Assistant Dashboard Example

A ready-to-paste Lovelace layout for the chamber heater. It groups the entities the way you'll actually use them: current status at the top, day-to-day controls in the middle, and safety/diagnostics at the bottom.

> **Entity IDs:** The IDs below assume the default `friendly_name: "Chamber Heater Controller"` from `esphome/settings.yaml`. If you changed it, or Home Assistant assigned different IDs, check the actual IDs under **Settings → Devices & Services → ESPHome → your device** and adjust. The `Fan Speed` sensor only exists on ESP32-C6-Zero builds — delete that row for ESP8285 builds.

Add a **Manual** card to your dashboard and paste:

```yaml
type: vertical-stack
cards:
  - type: gauge
    name: Chamber Temperature
    entity: sensor.chamber_heater_controller_current_temp
    unit: "°C"
    min: 0
    max: 85
    needle: true
    severity:
      green: 0
      yellow: 60
      red: 70

  - type: entities
    title: Chamber Heater
    entities:
      - entity: select.chamber_heater_controller_filament_temp_preset
        name: Filament Preset
      - entity: sensor.chamber_heater_controller_controller_status
        name: Heater Status
      - entity: number.chamber_heater_controller_low_temp_threshold
        name: Start Heating Below
      - entity: number.chamber_heater_controller_high_temp_threshold
        name: Stop Heating At
      - entity: sensor.chamber_heater_controller_printer_status
        name: Printer Status

  - type: entities
    title: Safety & Diagnostics
    entities:
      - entity: switch.chamber_heater_controller_emergency_stop
        name: Emergency Stop
      - entity: switch.chamber_heater_controller_over_temp_shutoff
        name: Over Temp Shutoff
      - entity: number.chamber_heater_controller_high_temp_alarm
        name: High Temp Alarm
      - entity: binary_sensor.chamber_heater_controller_alarm_active
        name: Alarm Active
      - entity: sensor.chamber_heater_controller_emergency_stop_time
        name: Emergency Stop Tripped
      - entity: sensor.chamber_heater_controller_fan_speed
        name: Fan Speed
      - entity: sensor.chamber_heater_controller_temp_sensor_status
        name: Temp Sensor
```

Notes:

- For **Fahrenheit builds**, change the gauge `unit` to `°F` and scale `min`/`max`/`severity` accordingly (e.g. max 185, yellow 140, red 158).
- A history-graph card for `sensor.chamber_heater_controller_current_temp` alongside the printer's chamber temperature sensor from the [Bambu Lab integration](https://github.com/greghesp/ha-bambulab) is handy for tuning presets:

```yaml
type: history-graph
title: Chamber Temperature History
hours_to_show: 6
entities:
  - sensor.chamber_heater_controller_current_temp
```

- Everything here is also available without Home Assistant via the built-in web UI on port 80.
