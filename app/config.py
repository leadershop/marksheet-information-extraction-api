import os
from dotenv import load_dotenv

# Loading variables from the .env file so we don't leak secrets on GitHub
load_dotenv()

# --- API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    # Giving a clear error because the app literally won't work without this
    raise ValueError(
        "Missing GEMINI_API_KEY! Please add it to your .env file. "
        "You can get one for free at https://aistudio.google.com/"
    )

# --- Upload Settings ---
# Defaulting to 10MB just to prevent someone from uploading a 1GB video and crashing the server
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "pdf,jpg,jpeg,png").split(",")

# --- OCR Setup ---
# For now, it only supports English. 
# EasyOCR can handle Hindi too, but I need to test that more before adding 'hi' here.
OCR_LANGUAGES = ["en"]

# --- AI Model Settings ---
# I chose 'gemini-flash-latest' because it's the most stable version in this environment.
GEMINI_MODEL = "gemini-flash-latest"

# Keeping temperature low (0.1) so the output is more predictable/consistent.
GEMINI_TEMPERATURE = 0.1

# --- Security ---
# Simple API Key for authentication
API_KEY = os.getenv("API_KEY", "marksheet-ai-secret-key")
