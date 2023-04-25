#!/bin/bash

# Exit immediately when one command fails
set -e

# Echo each command before executing
trap 'echo "# $(date --iso-8601=seconds): $BASH_COMMAND"' DEBUG

cd /home/flo/open-fixture-library

git pull -p
npm ci --include=dev
npm run build

if [ -e ./server ]; then
  cp ./server/* /home/flo
fi

pm2 reload /home/flo/ecosystem.config.js
