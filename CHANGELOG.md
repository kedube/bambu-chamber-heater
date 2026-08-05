# Changelog

Notable changes for each tagged release. Versions correspond to git tags and to the `sw_version` substitution in `esphome/settings.yaml`.

## Unreleased
- **Fixed:** Fahrenheit builds applied Celsius-valued safety thresholds. The runaway-detection rate limit and the ESP32 over-temperature LED threshold now live in the unit packages with converted values (`0.9°F/s`, `140°F`) — previously a Fahrenheit ESP32 build showed the over-temperature strobe above 60°F (~15.6°C), i.e. at room temperature.
- **Fixed:** Removed the `disable_crc` Modbus option, which was removed from ESPHome and failed validation on 2026.7.
- Added GitHub Actions CI: host unit tests, `esphome config` for all device/unit combinations, and `esphome compile` for both device targets (pinned to ESPHome 2026.7.2).
- Added host-side unit tests for the `include/` helper headers (`./test/run_tests.sh`).
- Added a Home Assistant Lovelace dashboard example (`docs/home-assistant-dashboard.md`), a GitHub bug-report template, and README/CHANGELOG documentation improvements.
- Clarified that `platformio.ini` exists only for IDE IntelliSense; firmware builds go through the ESPHome CLI.
- Added an automated release process: after CI passes on `main`, the Release workflow bumps `sw_version`, rotates this changelog's Unreleased section into the new version, and publishes a GitHub release with generated notes (highlights + commit list). CI also gained manual dispatch, a weekly schedule, and a latest-ESPHome canary job.

## 1.8.0 — 2026-07-11
- Performance improvements and code optimizations.

## 1.7.6 — 2026-06-05
- Fixed an end-of-job race where a finished print could set the preset to `Off` and then immediately re-select a filament preset, leaving the heater running.

## 1.7.5 — 2026-05-04
- Compatibility updates for ESPHome 2026.4.

## 1.7.4 — 2026-04-15
- GPIO pin assignments are now configurable in the device-specific YAML files.
- Removed duplicated code between device packages.

## 1.7.3 — 2026-04-14
- Restored the ability to manually pre-heat the chamber when the printer is not printing.
- Streamlined several safety checks.

## 1.7.2 — 2026-04-14
- Fixed status LED usage before the system is ready.
- Improved Home Assistant API disconnect handling.
- Fan-failure faults now only trigger while a print is active.
- Updated wiring diagram sources and the 3D model.

## 1.7.1 — 2026-04-13
- Fan tach now relies on the external pull-up resistor; removed the internal pull-up configuration.

## 1.7.0 — 2026-04-02
- Major refactor merging the ESP32 and ESP8285 codebases into one shared package structure (`esphome/packages/`).
- Cleaned up the repository directory layout and documentation.

## 1.6.x — 2026-03-18 to 2026-03-21
- Added ESP32-C6-Zero support (initially as parallel `*.esp32` tags): fan RPM monitoring with a failure latch that prevents the heater from running with a failed fan, WS2812 status LED, and updated wiring diagrams.
- Hardened emergency-stop handling so faults cannot be overridden while the underlying condition persists.
- Optimized fault detection and safety logging.

## 1.5.x — 2026-02-18 to 2026-03-01
- Added print-state automations: filament-type presets auto-select when a print starts, and the heater shuts off when a print finishes or is canceled.
- Expanded the supported filament types and refactored presets to be modular.
- Improved emergency-stop handling during communication errors with Home Assistant and the Bambu Lab integration.
- Numerous performance and memory optimizations; updated hardware and installation documentation.

## 1.4.x — 2026-02-14 to 2026-02-16
- Documented the Modbus address map and safety notes.
- Improved fault handling, thermal-overrun handling, and a cooling-mode bug fix.
- Human-readable emergency stop time output.

## 1.3 — 2026-02-12
- Initial public release for the Sinilink XY-WFPOW (ESP8285).
