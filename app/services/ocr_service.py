import easyocr
import numpy as np
from PIL import Image
from typing import Tuple
from app.config import OCR_LANGUAGES

# --- Global OCR Reader ---
# Creating the reader once at the start because it's heavy to load.
# This will trigger the model download (~100MB) the very first time you run the app.
_reader = None

def get_ocr_reader():
    """
    Returns the EasyOCR reader. 
    Using 'global' so we don't reload the models for every single request.
    """
    global _reader
    if _reader is None:
        print("[PROCESS] Initializing EasyOCR engine... (First run takes time)")
        # Forcing gpu=False so it works on everyone's laptop.
        _reader = easyocr.Reader(OCR_LANGUAGES, gpu=False)
        print("[SUCCESS] EasyOCR is ready to go.")
    return _reader


def extract_text_from_image(image_file_path: str) -> Tuple[str, float]:
    """
    Takes an image, runs OCR, and returns the full text + average confidence.
    """
    try:
        reader = get_ocr_reader()
        
        # Load the image
        img = Image.open(image_file_path)
        
        # --- Image Pre-processing for better OCR ---
        # 1. Convert to Grayscale
        img = img.convert('L')
        
        # 2. Enhance Contrast (helps remove light watermarks)
        from PIL import ImageEnhance
        img = ImageEnhance.Contrast(img).enhance(1.5)
        
        # 3. Sharpen (makes numbers clearer)
        img = ImageEnhance.Sharpness(img).enhance(2.0)
        
        # Convert to numpy array (EasyOCR expects this)
        img_array = np.array(img)
        
        # Perform OCR
        raw_results = reader.readtext(img_array, detail=1, contrast_ths=0.1, mag_ratio=1.5)
        
        if not raw_results:
            return "", 0.0
            
        # --- Robust Line Reconstruction ---
        # Sort by top coordinate first
        raw_results.sort(key=lambda x: x[0][0][1])
        
        test_lines = []
        if raw_results:
            current_line = [raw_results[0]]
            for i in range(1, len(raw_results)):
                # Increased buffer to 30px for high-res images to group rows better
                # We check the vertical distance between the top of the current block and the average top of the current line
                avg_top = sum([res[0][0][1] for res in current_line]) / len(current_line)
                if abs(raw_results[i][0][0][1] - avg_top) < 30:
                    current_line.append(raw_results[i])
                else:
                    # Sort the completed line by X-coordinate
                    current_line.sort(key=lambda x: x[0][0][0])
                    test_lines.append("  |  ".join([res[1] for res in current_line]))
                    current_line = [raw_results[i]]
            
            # Catch the remaining line
            current_line.sort(key=lambda x: x[0][0][0])
            test_lines.append("  |  ".join([res[1] for res in current_line]))

        full_document_text = "\n".join(test_lines)
        
        # Calculate scores
        conf_scores = [res[2] for res in raw_results]
        avg_conf = sum(conf_scores) / len(conf_scores) if conf_scores else 0.0
        
        print(f"[OCR] Reconstructed {len(test_lines)} logical lines of text.")
        return full_document_text, avg_conf
        
    except Exception as e:
        print(f"[OCR ERROR] Something went wrong while reading image: {str(e)}")
        raise Exception(f"Image OCR failed: {str(e)}")


def extract_text_from_pdf(pdf_file_path: str) -> Tuple[str, float]:
    """
    EasyOCR doesn't read PDFs directly, so I'm converting the PDF to an image first.
    I'm only doing the first page for now because marksheets are usually just one page.
    """
    from pdf2image import convert_from_path
    import tempfile
    import os
    
    try:
        print("[PDF] Converting first page of PDF to image...")
        
        # Converting page 1 only
        pages = convert_from_path(pdf_file_path, first_page=1, last_page=1)
        
        if not pages:
            raise Exception("PDF conversion failed - maybe the file is corrupt?")
        
        # Saving the page as a temporary PNG so we can run OCR on it
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp_img_path = tmp.name
            pages[0].save(tmp_img_path, 'PNG')
        
        # Run the standard image OCR
        text, confidence = extract_text_from_image(tmp_img_path)
        
        # Cleanup the temp image so we don't leave junk on the computer
        if os.path.exists(tmp_img_path):
            os.remove(tmp_img_path)
            
        return text, confidence
        
    except Exception as e:
        print(f"[PDF ERROR] Failed to process PDF: {str(e)}")
        raise Exception(f"PDF OCR failed: {str(e)}")
