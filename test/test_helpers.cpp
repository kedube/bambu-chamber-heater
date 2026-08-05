// Host-side unit tests for the pure helper headers in include/.
// These headers contain the safety-decision logic used by the ESPHome lambdas,
// so they are tested natively without any ESP toolchain. wifi_protocol_helper.h
// depends on ESP-IDF and is intentionally not covered here.
//
// Build and run: ./test/run_tests.sh (or see .github/workflows/ci.yml)

#include <array>
#include <cmath>
#include <cstdio>
#include <string>

#include "../include/api_client_helper.h"
#include "../include/preset_helper.h"
#include "../include/printer_state_helper.h"
#include "../include/status_led_helper.h"

static int failures = 0;

#define EXPECT(cond)                                                       \
  do {                                                                     \
    if (!(cond)) {                                                         \
      std::printf("FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond);          \
      ++failures;                                                          \
    }                                                                      \
  } while (0)

static void test_api_client_helper() {
  EXPECT(classify_api_client("Home Assistant 2026.7.1") == API_CLIENT_HOME_ASSISTANT);
  EXPECT(classify_api_client("HOME ASSISTANT") == API_CLIENT_HOME_ASSISTANT);
  EXPECT(classify_api_client("ESPHome Logs 2026.7.2") == API_CLIENT_ESPHOME_LOGS);
  EXPECT(classify_api_client("esphome logs") == API_CLIENT_ESPHOME_LOGS);
  EXPECT(classify_api_client("aioesphomeapi") == API_CLIENT_OTHER);
  EXPECT(classify_api_client("") == API_CLIENT_OTHER);
}

static void test_printer_state_helper() {
  EXPECT(is_printer_actively_printing("running"));
  EXPECT(is_printer_actively_printing("prepare"));
  EXPECT(is_printer_actively_printing("slicing"));
  EXPECT(!is_printer_actively_printing("pause"));
  EXPECT(!is_printer_actively_printing("idle"));
  EXPECT(!is_printer_actively_printing(""));

  EXPECT(is_printer_inactive("finish"));
  EXPECT(is_printer_inactive("failed"));
  EXPECT(is_printer_inactive("offline"));
  EXPECT(is_printer_inactive("idle"));
  // "pause" is deliberately neither active nor inactive: the chamber should
  // hold its state rather than shut off during a paused print.
  EXPECT(!is_printer_inactive("pause"));
  EXPECT(!is_printer_inactive("running"));
}

static void test_preset_helper() {
  EXPECT(to_upper_copy("petg hf") == "PETG HF");
  EXPECT(to_upper_copy("PA6-gf") == "PA6-GF");
  EXPECT(to_upper_copy("") == "");

  // NaN current value must always request an update.
  EXPECT(should_update_threshold(NAN, 22.0f));
  EXPECT(!should_update_threshold(22.0f, 22.0f));
  EXPECT(!should_update_threshold(22.04f, 22.0f));  // inside 0.05 tolerance
  EXPECT(should_update_threshold(22.1f, 22.0f));

  const std::array<FilamentPresetEntry, 3> presets = {{
      {"PLA", {21.0f, 23.0f}},
      {"ABS", {54.0f, 56.0f}},
      {"PC", {79.0f, 81.0f}},
  }};
  const FilamentPresetEntry *abs_preset = find_filament_preset(presets, "ABS");
  EXPECT(abs_preset != nullptr);
  EXPECT(abs_preset->second.first == 54.0f);
  EXPECT(abs_preset->second.second == 56.0f);
  EXPECT(find_filament_preset(presets, "PETG") == nullptr);
  EXPECT(find_filament_preset(presets, "") == nullptr);
}

static void test_filament_aliases() {
  // Aliases map Bambu filament names (already uppercased) onto preset names.
  EXPECT(std::string(lookup_filament_preset_name("PLA")) == "PLA");
  EXPECT(std::string(lookup_filament_preset_name("PLA-CF")) == "PLA");
  EXPECT(std::string(lookup_filament_preset_name("MATTE PLA")) == "PLA");
  EXPECT(std::string(lookup_filament_preset_name("TPU 95A")) == "TPU");
  EXPECT(std::string(lookup_filament_preset_name("PETG HF")) == "PETG");
  EXPECT(std::string(lookup_filament_preset_name("ASA-AERO")) == "ASA");
  EXPECT(std::string(lookup_filament_preset_name("PA6-GF")) == "PA6");
  EXPECT(std::string(lookup_filament_preset_name("PAHT-CF")) == "PAHT");
  EXPECT(lookup_filament_preset_name("WOOD") == nullptr);
  EXPECT(lookup_filament_preset_name("pla") == nullptr);  // input must be uppercased
  EXPECT(lookup_filament_preset_name("") == nullptr);

  // Every alias target must exist in the preset tables built from
  // celsius.yaml / fahrenheit.yaml (kept in sync with settings.yaml).
  const std::array<FilamentPresetEntry, 17> full_presets = {{
      {"PLA", {}}, {"TPU", {}}, {"PETG", {}}, {"PCTG", {}}, {"ABS", {}},
      {"ASA", {}}, {"PC", {}}, {"PET", {}}, {"PA", {}}, {"PA6", {}},
      {"PA12", {}}, {"PA612", {}}, {"PPA", {}}, {"PP", {}}, {"PPS", {}},
      {"PE", {}}, {"PAHT", {}},
  }};
  const char *alias_inputs[] = {
      "PLA", "PLA SILK", "PLA+", "PLA-CF", "MATTE PLA", "PLA HIGH SPEED",
      "TPU", "TPU 95A", "TPU 85A HF",
      "PETG", "PETG HF", "PETG-CF", "PETG-RCF", "PETG-ESD",
      "PCTG", "ABS", "ABS-GF", "ASA", "ASA-CF", "ASA-AERO",
      "PC", "PC FR", "PET", "PET-CF", "PA", "PA-CF",
      "PA6", "PA6-GF", "PA6-CF", "PA12", "PA12-CF", "PA612", "PA612-CF",
      "PPA-GF", "PPA-CF", "PP", "PP-GF", "PP-CF", "PPS", "PPS-CF",
      "PE", "PE-CF", "PAHT-CF",
  };
  for (const char *input : alias_inputs) {
    const char *preset_name = lookup_filament_preset_name(input);
    EXPECT(preset_name != nullptr);
    if (preset_name != nullptr) {
      EXPECT(find_filament_preset(full_presets, preset_name) != nullptr);
    }
  }
}

static void test_status_led_helper() {
  // Priority order: emergency stop > Wi-Fi loss > over-temp > heating > idle.
  EXPECT(compute_status_led_mode(true, false, 200.0f, 60.0f, "Active") ==
         STATUS_LED_EMERGENCY_STOP);
  EXPECT(compute_status_led_mode(false, false, 200.0f, 60.0f, "Active") ==
         STATUS_LED_WIFI_DISCONNECTED);
  EXPECT(compute_status_led_mode(false, true, 61.0f, 60.0f, "Stopped") ==
         STATUS_LED_OVERTEMP_WARNING);
  EXPECT(compute_status_led_mode(false, true, 25.0f, 60.0f, "Active") ==
         STATUS_LED_HEATER_ACTIVE);
  EXPECT(compute_status_led_mode(false, true, 25.0f, 60.0f, "Stopped") ==
         STATUS_LED_IDLE);
  EXPECT(compute_status_led_mode(false, true, 25.0f, 60.0f, "Unknown") ==
         STATUS_LED_IDLE);

  // NaN temperature (no reading yet) must not trigger the over-temp warning.
  EXPECT(compute_status_led_mode(false, true, NAN, 60.0f, "Stopped") ==
         STATUS_LED_IDLE);

  // Boundary: warning requires strictly above the threshold.
  EXPECT(compute_status_led_mode(false, true, 60.0f, 60.0f, "Stopped") ==
         STATUS_LED_IDLE);

  // Fahrenheit-style threshold (140°F): normal chamber temps must stay quiet.
  EXPECT(compute_status_led_mode(false, true, 95.0f, 140.0f, "Active") ==
         STATUS_LED_HEATER_ACTIVE);
  EXPECT(compute_status_led_mode(false, true, 141.0f, 140.0f, "Active") ==
         STATUS_LED_OVERTEMP_WARNING);
}

int main() {
  test_api_client_helper();
  test_printer_state_helper();
  test_preset_helper();
  test_filament_aliases();
  test_status_led_helper();

  if (failures != 0) {
    std::printf("%d test(s) FAILED\n", failures);
    return 1;
  }
  std::printf("All tests passed\n");
  return 0;
}
