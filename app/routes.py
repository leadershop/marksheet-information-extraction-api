from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Security
from fastapi.security.api_key import APIKeyHeader
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import ExtractionResponse, ErrorResponse
from app.config import API_KEY
from app.utils.file_handler import validate_file, save_upload_file_tmp, cleanup_temp_file, get_file_type
from app.utils.text_cleaner import clean_ocr_text, extract_text_snippet
from app.utils.bounding_box_utils import apply_bounding_boxes
from app.services.ocr_service import extract_text_from_image, extract_text_from_pdf
from app.services.llm_service import structure_data_with_llm
from app.services.confidence_service import calculate_overall_confidence

# --- Security Setup ---
api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

async def get_api_key(api_key: str = Security(api_key_header)):
    if api_key == API_KEY:
        return api_key
    raise HTTPException(
        status_code=403,
        detail="Could not validate API Key. Please provide a valid X-API-KEY header."
    )

# Initializing FastAPI
# I set the docs_url to '/' so the Swagger UI opens by default at localhost:8000
app = FastAPI(
    title="Marksheet AI API",
    description="A simple API that uses OCR and LLMs to get data out of academic marksheets.",
    version="1.0.0",
    docs_url="/"
)

# Enabling CORS so the local frontend can talk to the backend.
# I'm using "*" for now because it's just a local project, but I know it's not and
# for a real production app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
async def health_check():
    # Just a simple health check to make sure the server is actually alive
    # Use this to debug connectivity issues.
    return {
        "status": "healthy",
        "message": "The API is up and running!"
    }

@app.post(
    "/extract",
    response_model=ExtractionResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    tags=["Core Logic"]
)
async def extract_marksheet(
    file: UploadFile = File(..., description="PDF or Image of a marksheet"),
    api_key: str = Depends(get_api_key)
):
    """
    This is the main endpoint. I've broken the logic into a few steps (OCR, cleaning, AI)
    to keep it readable. Otherwise, this function would be 100 lines long!
    """
    temp_file_path = None
    
    try:
        # 1. Basic Validation (file size, format)
        print(f"\n[INFO] Starting extraction for: {file.filename}")
        validate_file(file)
        
        # 2. Save the file temporarily
        # I'm saving the file because EasyOCR needs a path to read from
        temp_file_path = save_upload_file_tmp(file)
        
        # 3. OCR Stage
        # Checking extension to decide how to process (image vs pdf)
        file_ext = get_file_type(file.filename)
        print(f"[STAGE] Running OCR for {file_ext} type...")
        
        if file_ext == "pdf":
            raw_text, ocr_confidence, metadata = extract_text_from_pdf(temp_file_path)
        else:
            raw_text, ocr_confidence, metadata = extract_text_from_image(temp_file_path)
            
        if not raw_text:
            # If no text is found, there's no point in continuing
            raise HTTPException(
                status_code=400,
                detail="Could not find any text. Is the image clear enough?"
            )
            
        print(f"[DEBUG] Text Preview: {extract_text_snippet(raw_text, 100)}...")
        
        # 4. Clean the text
        # OCR data often has weird whitespace or line breaks
        cleaned_text = clean_ocr_text(raw_text)
        
        # 5. Send to LLM (Gemini)
        # We now pass both the cleaned text AND the image path.
        # This allows Gemini to use Vision to see the layout for better accuracy.
        print("[STAGE] Sending data to Gemini for Vision-based structuring...")
        # Note: If it's a PDF, we've already converted it to an image for OCR, 
        # so this path still works.
        structured_data = structure_data_with_llm(cleaned_text, temp_file_path)
        
        # 6. Confidence Scoring
        overall_conf = calculate_overall_confidence(structured_data, ocr_confidence)
        
        # 7. Grounding (Bounding Boxes)
        # We match the extracted text back to the OCR metadata to find coordinates.
        print("[STAGE] Mapping extracted fields to bounding boxes...")
        apply_bounding_boxes(structured_data, metadata)
        
        # 8. Final Response
        result = {
            **structured_data,
            "overall_confidence": overall_conf
        }
        
        print(f"[DONE] Extraction finished. Confidence: {overall_conf:.2f}\n")
        return result
        
    except HTTPException as he:
        # Standard FastAPI exceptions
        raise he
    except Exception as e:
        # Catching everything else so the server doesn't just crash silently
        print(f"[ERROR] Logic failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal Error: {str(e)}"
        )
    finally:
        # Crucial step: clean up the temporary file so we don't fill up the server's disk.
        # This part runs whether the extraction worked or failed.
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

# Custom error handlers to keep JSON responses consistent
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong on the server.", "detail": str(exc)}
    )
