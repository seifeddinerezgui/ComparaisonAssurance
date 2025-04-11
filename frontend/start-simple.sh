#!/bin/bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install --silent --no-fund || true

# Disable Angular analytics
export NG_CLI_ANALYTICS=false

# Create Angular configuration to disable analytics prompts
echo '{"analytics":false}' > ~/.angular-config.json

# Start the server in a way that bypasses the prompt
NODE_OPTIONS=--max_old_space_size=4096 npx --yes ng serve --port 5000 --host 0.0.0.0 --disable-host-check