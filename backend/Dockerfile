# Use Ubuntu-based Python image for better package compatibility
FROM python:3.9

# Set working directory
WORKDIR /app

# Update package lists and install minimal dependencies
RUN apt-get update && \
    apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy models (only the essential one)
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Create directories for data and models
RUN mkdir -p /app/all_min_chromadb /app/chroma_db_jobs /app/classification /app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
