#!/bin/bash

docker image build --rm --no-cache -t mc-web-tools:latest -f Dockerfile .
