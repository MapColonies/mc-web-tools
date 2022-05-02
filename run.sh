#!/bin/bash

tm() {
  local start=$(date +%s)
  $@
  local exit_code=$?
  echo >&2 "took ~$(($(date +%s)-${start})) seconds. exited with ${exit_code}"
  return $exit_code
}

echo vrt:
gdalbuildvrt terrain.vrt -resolution highest -r nearest -input_file_list ./merged_ascending.txt
echo ovr:
gdaladdo terrain.vrt -r bilinear -ro 2 4 8 16 32 64 128 256 512 1024 2048 4096 8192 16384 32768
echo terrain:
mkdir -p ./terrain
tm ctb-tile -f Mesh -C -N -s 19 -e 0 -o ./terrain terrain.vrt
echo layer.json:
ctb-tile -f Mesh -C -N -s 19 -e 0 -l -o ./terrain terrain.vrt