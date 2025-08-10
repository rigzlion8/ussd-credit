FROM python:3.11-slim

WORKDIR /app

# Install minimal system dependencies needed for psycopg2
RUN apt-get update --quiet --yes \
    && apt-get install --quiet --yes --no-install-recommends \
        libpq-dev \
        gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --quiet -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT environment variable)
EXPOSE 8000

# Run the application with Railway's PORT
CMD gunicorn --bind 0.0.0.0:$PORT wsgi:app
