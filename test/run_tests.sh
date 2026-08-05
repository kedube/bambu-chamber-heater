#!/bin/sh
# Build and run the host-side unit tests for the include/ helper headers.
# Requires any C++17 compiler (clang++ or g++); no ESP toolchain needed.
set -eu

cd "$(dirname "$0")"

CXX="${CXX:-c++}"
OUT="${TMPDIR:-/tmp}/bambu_chamber_heater_tests"

"$CXX" -std=c++17 -Wall -Wextra -Werror -o "$OUT" test_helpers.cpp
"$OUT"
