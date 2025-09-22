@echo off
echo Checking Natalify deployment readiness...

REM Check if required directories exist
if not exist "natalify-frontend" (
  echo ❌ natalify-frontend directory not found
  exit /b 1
)

if not exist "natalify-backend" (
  echo ❌ natalify-backend directory not found
  exit /b 1
)

REM Check if Netlify functions directory exists
if not exist "natalify-frontend\netlify\functions" (
  echo ❌ Netlify functions directory not found
  exit /b 1
)

REM Check if required files exist
set required_files="natalify-frontend\package.json" "natalify-frontend\vite.config.js" "natalify-frontend\index.html" "natalify-frontend\netlify.toml" "natalify-frontend\netlify\functions\api.js" "natalify-frontend\netlify\functions\package.json"

for %%f in (%required_files%) do (
  if not exist %%f (
    echo ❌ Required file not found: %%f
    exit /b 1
  )
)

echo ✅ All required files and directories are present
echo ✅ Ready for Netlify deployment