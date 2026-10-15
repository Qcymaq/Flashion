# Backend Dockerfile for FastAPI
FROM python:3.11-slim

# Set work directory to /backend
WORKDIR /backend

# Install build dependencies and system libraries for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (copied first so this layer is cached)
COPY backend/requirements.txt /backend/requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /backend/requirements.txt

# Copy the backend source code
COPY backend /backend

# Copy startup script
COPY backend/startup.sh /backend/startup.sh

# Make startup script executable
RUN chmod +x /backend/startup.sh

# Expose FastAPI port
EXPOSE 8000

# Entrypoint
CMD ["/backend/startup.sh"] 