# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    ffmpeg \
    libsm6 \
    libxext6 \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the port that the app runs on (Hugging Face Spaces uses 7860)
EXPOSE 7860

# Command to run the application
# We use 0.0.0.0 to allow external connections
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
