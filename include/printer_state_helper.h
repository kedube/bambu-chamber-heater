#pragma once

#include <string>

inline bool is_printer_actively_printing(const std::string &printer_status) {
  return printer_status == "running" || printer_status == "prepare" ||
         printer_status == "slicing";
}

inline bool is_printer_inactive(const std::string &printer_status) {
  return printer_status == "finish" || printer_status == "failed" ||
         printer_status == "offline" || printer_status == "idle";
}
