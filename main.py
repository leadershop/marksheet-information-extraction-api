import uvicorn
from app.routes import app

# This is the main starting point of the application
# I'm keeping this file very simple and putting the logic in the 'app' folder
if __name__ == "__main__":
    # Starting the server with hot-reload enabled 
    # This makes it easier to test changes during development
    print("Starting the Marksheet Extraction API...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
