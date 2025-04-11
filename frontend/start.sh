#!/bin/bash
# Set up Angular analytics configuration to disable prompts
mkdir -p ~/.config/angular
echo '{"analytics":false}' > ~/.config/angular/config.json
echo '{"analytics":false}' > ~/.angular-config.json

# Move to frontend directory and install dependencies
cd frontend
npm install ajv --no-fund
npm install --no-fund

# Turn off analytics and force non-interactive mode
export NG_CLI_ANALYTICS=false
export CI=true

# Run the no-prompt start script
npm run start-no-prompt