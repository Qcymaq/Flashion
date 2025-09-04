# Backend Dockerfile for FastAPI
FROM python:3.11-slim

# Set work directory to /backend
WORKDIR /backend

# Copy environment.yml for requirements
COPY environment.yml /backend/environment.yml

# Install build dependencies and system libraries for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip && \
    pip install pyyaml && \
    python -c "import yaml; env=yaml.safe_load(open('/backend/environment.yml')); print('\n'.join(env['dependencies'][-1]['pip']))" > /backend/requirements.txt
RUN pip install -r /backend/requirements.txt

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