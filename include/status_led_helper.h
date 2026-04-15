#pragma once

#include <cmath>
#include <string>

enum StatusLedMode {
  STATUS_LED_IDLE = 0,
  STATUS_LED_EMERGENCY_STOP = 1,
  STATUS_LED_WIFI_DISCONNECTED = 2,
  STATUS_LED_OVERTEMP_WARNING = 3,
  STATUS_LED_HEATER_ACTIVE = 4,
};

inline StatusLedMode compute_status_led_mode(bool emergency_stop_active,
                                             bool wifi_connected,
                                             float current_temperature,
                                             float overtemp_threshold,
                                             const std::string &controller_status) {
  if (emergency_stop_active) {
    return STATUS_LED_EMERGENCY_STOP;
  }

  if (!wifi_connected) {
    return STATUS_LED_WIFI_DISCONNECTED;
  }

  if (!std::isnan(current_temperature) && current_temperature > overtemp_threshold) {
    return STATUS_LED_OVERTEMP_WARNING;
  }

  if (controller_status == "Active") {
    return STATUS_LED_HEATER_ACTIVE;
  }

  return STATUS_LED_IDLE;
}
