#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
until python -c "import asyncio; from app.utils.database import connect_to_mongo; asyncio.run(connect_to_mongo())" 2>/dev/null; do
  echo "MongoDB not ready yet, waiting..."
  sleep 2
done

echo "MongoDB is ready!"

# Create admin user
echo "Creating admin user..."
python -m app.create_admin

# Start the FastAPI application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug 