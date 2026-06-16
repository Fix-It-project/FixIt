FROM python:3.11-slim

WORKDIR /app

ARG INSTALL_AUDIO=false
ARG REQUIREMENTS_FILE=requirements.txt

# Install only the system packages needed by the selected feature set.
RUN apt-get update && apt-get install -y curl \
    && if [ "$INSTALL_AUDIO" = "true" ]; then apt-get install -y ffmpeg; fi \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r ${REQUIREMENTS_FILE}

# Copy application code and data
COPY app/ ./app/
COPY Data/ ./Data/
COPY run.py .

# Expose the API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run the server (production mode, no reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
