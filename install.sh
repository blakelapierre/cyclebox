#!/bin/bash

cd frontend && \
  npm install && \
  bower install && \
  cp bower_components/mathbox/build/mathbox-bundle.min.js src/lib/mathbox-bundle.min.js