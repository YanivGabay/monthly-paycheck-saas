FROM node:20-alpine AS frontend-builder

# Build React frontend
WORKDIR /frontend
COPY frontend/ ./
RUN npm install --production=false

# Set build-time environment variables for Vite
ENV VITE_GOOGLE_CLIENT_ID="558633025816-fp47us6m08jv5khc4d14esj6jeugpror.apps.googleusercontent.com"

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

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/api/health')" || exit 1

# Expose port
EXPOSE 8000

# Run the application using the PORT variable provided by the environment
# Note: The actual port is set by Railway's $PORT variable, not hardcoded here.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] test 8