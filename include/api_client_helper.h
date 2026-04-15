#pragma once

#include <algorithm>
#include <string>

enum ApiClientType {
  API_CLIENT_OTHER = 0,
  API_CLIENT_HOME_ASSISTANT = 1,
  API_CLIENT_ESPHOME_LOGS = 2,
};

inline ApiClientType classify_api_client(const std::string &client_info) {
  std::string client_name = client_info;
  std::transform(
      client_name.begin(),
      client_name.end(),
      client_name.begin(),
      [](unsigned char c) { return std::tolower(c); });

  if (client_name.find("home assistant") != std::string::npos) {
    return API_CLIENT_HOME_ASSISTANT;
  }

  if (client_name.find("esphome logs") != std::string::npos) {
    return API_CLIENT_ESPHOME_LOGS;
  }

  return API_CLIENT_OTHER;
}
