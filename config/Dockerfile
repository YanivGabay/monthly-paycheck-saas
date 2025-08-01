FROM node:20-alpine AS frontend-builder

# Build React frontend
WORKDIR /frontend
COPY frontend/ ./
RUN npm install --production=false

# Set build-time environment variables for Vite
ENV VITE_GOOGLE_CLIENT_ID="14452849971-k607c8k3kg3mc2jp9bstf3tnkbst4qgb.apps.googleusercontent.com"

RUN echo "=== Starting React build (this will show TS errors) ==="
RUN npm run build
RUN echo "=== Build completed, checking dist ==="
RUN ls -la dist/

# Python backend stage
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PDF processing (Railway optimized)
# Split into smaller steps to avoid memory/timeout issues
RUN apt-get update \
    && apt-get install -y --no-install-recommends poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1-mesa-glx libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code as package structure (NO SENSITIVE DATA!)
COPY app/ ./app/
COPY config/ ./config/
# NOTE: company_configs/ and .env* are excluded via .dockerignore for security
# These will be provided at runtime via environment variables and volumes

# Copy built frontend from previous stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Create necessary directories (empty, will be populated at runtime)
RUN mkdir -p uploads previews samples debug company_configs

# Set environment variables
ENV PYTHONPATH=/app

# Expose port (Railway will set PORT dynamically, usually 8080)
EXPOSE 8080

# Run the application using the PORT variable provided by the environment
# Railway sets PORT dynamically (usually 8080), fallback to 8000 for local dev
# Using shell form to ensure environment variable substitution works correctly
CMD sh -c "echo Starting uvicorn on port ${PORT:-8080} && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --log-level info"