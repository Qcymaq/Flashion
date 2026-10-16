#!/bin/bash

# Wait for MongoDB to be ready.
# Only the last line of the error (exception type and message) is shown, so a
# wrong or empty MONGO_URI is visible in the logs instead of looping silently.
echo "Waiting for MongoDB to be ready..."
until MONGO_ERROR="$(python -c "import asyncio; from app.utils.database import connect_to_mongo; asyncio.run(connect_to_mongo())" 2>&1 >/dev/null)"; do
  echo "MongoDB not ready yet, waiting... (${MONGO_ERROR##*$'\n'})"
  sleep 2
done

echo "MongoDB is ready!"

# Create admin user
echo "Creating admin user (only if ADMIN_EMAIL and ADMIN_PASSWORD are set)..."
python -m app.create_admin

# Start the FastAPI application.
# Auto-reload and debug logging are only used when ENV is development or dev.
# Same rule as get_environment() in app/utils/auth.py: ENV, then ENVIRONMENT,
# default "development". The Docker image sets ENV=production by default.
APP_ENV="$(echo "${ENV:-${ENVIRONMENT:-development}}" | tr '[:upper:]' '[:lower:]')"
if [ "$APP_ENV" = "development" ] || [ "$APP_ENV" = "dev" ]; then
  echo "Starting FastAPI application in development mode (auto-reload, debug logs)..."
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
else
  echo "Starting FastAPI application..."
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info
fi
