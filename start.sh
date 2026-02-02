#!/bin/bash
# Wrapper to force correct startup
cd /var/www/ma-links
export PORT=3001
# Explicitly use npx next just in case npm logic is weird
# Or use npm start -- -p 3001
source .env
./node_modules/.bin/next start -p 3001
