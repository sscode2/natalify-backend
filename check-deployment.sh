#!/bin/bash

echo "Checking Natalify deployment readiness..."

# Check if required directories exist
if [ ! -d "natalify-frontend" ]; then
  echo "❌ natalify-frontend directory not found"
  exit 1
fi

if [ ! -d "natalify-backend" ]; then
  echo "❌ natalify-backend directory not found"
  exit 1
fi

# Check if Netlify functions directory exists
if [ ! -d "natalify-frontend/netlify/functions" ]; then
  echo "❌ Netlify functions directory not found"
  exit 1
fi

# Check if required files exist
required_files=(
  "natalify-frontend/package.json"
  "natalify-frontend/vite.config.js"
  "natalify-frontend/index.html"
  "natalify-frontend/netlify.toml"
  "natalify-frontend/netlify/functions/api.js"
  "natalify-frontend/netlify/functions/package.json"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Required file not found: $file"
    exit 1
  fi
done

echo "✅ All required files and directories are present"
echo "✅ Ready for Netlify deployment"