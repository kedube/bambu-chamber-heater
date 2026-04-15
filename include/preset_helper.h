#pragma once

#include <algorithm>
#include <cmath>
#include <string>

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
