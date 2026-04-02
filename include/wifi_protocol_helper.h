#pragma once

#include <string>

#include "esp_err.h"
#include "esp_wifi.h"

inline std::string get_negotiated_wifi_protocol() {
  wifi_phy_mode_t phy_mode;
  const esp_err_t err = esp_wifi_sta_get_negotiated_phymode(&phy_mode);

  if (err != ESP_OK) {
    return "Disconnected";
  }

  switch (phy_mode) {
    case WIFI_PHY_MODE_11B:
      return "802.11b";
    case WIFI_PHY_MODE_11G:
      return "802.11g";
    case WIFI_PHY_MODE_HT20:
    case WIFI_PHY_MODE_HT40:
      return "802.11n";
    case WIFI_PHY_MODE_HE20:
      return "802.11ax";
    case WIFI_PHY_MODE_LR:
      return "802.11 LR";
    default:
      return "Unknown";
  }
}
