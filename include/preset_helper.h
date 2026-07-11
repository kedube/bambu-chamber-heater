#pragma once

#include <algorithm>
#include <cmath>
#include <string>
#include <utility>

inline std::string to_upper_copy(const std::string &value) {
  std::string result;
  result.reserve(value.length());
  std::transform(
      value.begin(),
      value.end(),
      std::back_inserter(result),
      [](unsigned char c) { return std::toupper(c); });
  return result;
}

inline bool should_update_threshold(float current_value, float target_value,
                                    float tolerance = 0.05f) {
  return std::isnan(current_value) || std::fabs(current_value - target_value) > tolerance;
}

// Entry type of the filament preset table defined in celsius.yaml / fahrenheit.yaml.
// The table global is spelled with std types only because ESPHome declares globals
// before including this header. Each entry is {name, {start_temp, stop_temp}}.
using FilamentPresetEntry = std::pair<const char *, std::pair<float, float>>;

template<typename Container>
inline const FilamentPresetEntry *find_filament_preset(const Container &presets,
                                                       const std::string &name) {
  for (const auto &preset : presets) {
    if (preset.first != nullptr && name == preset.first) {
      return &preset;
    }
  }
  return nullptr;
}

// Maps Bambu filament type names (uppercased) to chamber preset names.
// Returns nullptr for unknown filament types.
inline const char *lookup_filament_preset_name(const std::string &filament_type_upper) {
  static const std::pair<const char *, const char *> FILAMENT_TYPE_ALIASES[] = {
      {"PLA", "PLA"}, {"PLA SILK", "PLA"}, {"PLA+", "PLA"}, {"PLA-CF", "PLA"},
      {"MATTE PLA", "PLA"}, {"PLA HIGH SPEED", "PLA"},
      {"TPU", "TPU"}, {"TPU 95A", "TPU"}, {"TPU 85A HF", "TPU"},
      {"PETG", "PETG"}, {"PETG HF", "PETG"}, {"PETG-CF", "PETG"},
      {"PETG-RCF", "PETG"}, {"PETG-ESD", "PETG"},
      {"PCTG", "PCTG"},
      {"ABS", "ABS"}, {"ABS-GF", "ABS"},
      {"ASA", "ASA"}, {"ASA-CF", "ASA"}, {"ASA-AERO", "ASA"},
      {"PC", "PC"}, {"PC FR", "PC"},
      {"PET", "PET"}, {"PET-CF", "PET"},
      {"PA", "PA"}, {"PA-CF", "PA"},
      {"PA6", "PA6"}, {"PA6-GF", "PA6"}, {"PA6-CF", "PA6"},
      {"PA12", "PA12"}, {"PA12-CF", "PA12"},
      {"PA612", "PA612"}, {"PA612-CF", "PA612"},
      {"PPA-GF", "PPA"}, {"PPA-CF", "PPA"},
      {"PP", "PP"}, {"PP-GF", "PP"}, {"PP-CF", "PP"},
      {"PPS", "PPS"}, {"PPS-CF", "PPS"},
      {"PE", "PE"}, {"PE-CF", "PE"},
      {"PAHT-CF", "PAHT"},
  };

  for (const auto &alias : FILAMENT_TYPE_ALIASES) {
    if (filament_type_upper == alias.first) {
      return alias.second;
    }
  }
  return nullptr;
}
