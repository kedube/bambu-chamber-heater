# Helper Headers

C++ helpers included by the ESPHome YAML packages (see the `esphome:` → `includes:` lists in `esphome/packages/`). Keeping this logic in headers keeps the YAML lambdas short and lets both device targets share one implementation.

| Header | Used by | Purpose |
| :--- | :--- | :--- |
| `api_client_helper.h` | `controller_shared.yaml` | Classifies ESPHome API clients (Home Assistant vs. log viewers vs. other) so the Home Assistant disconnect safety trigger doesn't fire when a log viewer disconnects. |
| `preset_helper.h` | `controller_shared.yaml`, `celsius.yaml`, `fahrenheit.yaml` | Filament preset table lookup, Bambu filament-type → preset-name mapping, and threshold update helpers. |
| `printer_state_helper.h` | `controller_shared.yaml` | Maps Bambu printer status strings to "actively printing" / "inactive" for the auto-heat and end-of-job shutoff logic. |
| `status_led_helper.h` | `device_esp32.yaml` | Computes the WS2812 status LED mode (emergency stop, Wi-Fi lost, over-temp, heating, idle) from system state. |
| `wifi_protocol_helper.h` | `device_esp32.yaml` | Reads the negotiated Wi-Fi PHY mode (802.11b/g/n/ax) from ESP-IDF for the Wi-Fi protocol diagnostic sensor. |
