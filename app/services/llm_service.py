import google.generativeai as genai
import json
from typing import Dict, Any
from app.config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TEMPERATURE

# Setting up the Gemini API key
genai.configure(api_key=GEMINI_API_KEY)

def create_prompt(messy_text: str) -> str:
    """
    This is where I define the instructions for Gemini. 
    I'm telling it exactly what fields I need and how the JSON should look.
    """
    
    # Using a clear, structured prompt to get better results from the model.
    # I found that giving it a specific JSON template works best.
    prompt = f"""
I have extracted text from a marksheet. Columns are separated by " | ". It might be messy due to background watermarks.

Your task: Extract information into a valid JSON.

Special Extraction Rules:
1. Candidate Info:
   - Identify Name after "NAME".
   - Identify Father's Name after "S/XX of", "S/O", or "GOPINATH".
   - Combine "ROLL" (e.g., F06931) and "NO" (e.g., 0060) into "roll_number".
2. Subject Table (West Bengal Style):
   - This board often splits subjects into Written and Oral.
   - Example row: "PSC. (WRITTEN)  |  90  |  70"
   - Look for individual scores (usually 1-2 digits) next to subject names.
   - If you see a "TOTAL" row for a subject group, use that for the subject's marks.
   - Subjects to look for: First Language, Second Language, Mathematics, Physical Science (PSC), Life Science (LSC), History, Geography.
3. Logical Cleaning:
   - If OCR shows "450" but the max marks is "90", the student likely got "45". Use your logic to fix obvious OCR merges.
   - Normalize: "PSC" -> "Physical Science", "LSC" -> "Life Science", "GEO" -> "Geography".

Here is the OCR text:
---
{messy_text}
---

Please return ONLY JSON:
{{
  "candidate_details": {{
    "name": {{"value": "string or null", "confidence": 0.0-1.0}},
    "father_name": {{"value": "string or null", "confidence": 0.0-1.0}},
    "mother_name": {{"value": "string or null", "confidence": 0.0-1.0}},
    "roll_number": {{"value": "string or null", "confidence": 0.0-1.0}},
    "registration_number": {{"value": "string or null", "confidence": 0.0-1.0}},
    "date_of_birth": {{"value": "string or null", "confidence": 0.0-1.0}},
    "exam_year": {{"value": "string or null", "confidence": 0.0-1.0}},
    "board_university": {{"value": "string or null", "confidence": 0.0-1.0}},
    "institution": {{"value": "string or null", "confidence": 0.0-1.0}}
  }},
  "academic_details": {{
    "subjects": [
      {{
        "subject": {{"value": "string", "confidence": 0.0-1.0}},
        "max_marks": {{"value": "string", "confidence": 0.0-1.0}},
        "obtained_marks": {{"value": "string", "confidence": 0.0-1.0}},
        "grade": {{"value": "string or null", "confidence": 0.0-1.0}}
      }}
    ],
    "overall_result": {{"value": "string or null", "confidence": 0.0-1.0}},
    "overall_grade": {{"value": "string or null", "confidence": 0.0-1.0}},
    "division": {{"value": "string or null", "confidence": 0.0-1.0}},
    "issue_date": {{"value": "string or null", "confidence": 0.0-1.0}},
    "issue_place": {{"value": "string or null", "confidence": 0.0-1.0}}
  }}
}}

Return ONLY the JSON. No extra text or explanations.
"""
    return prompt


from PIL import Image

def structure_data_with_llm(ocr_output: str, image_path: str = None) -> Dict[str, Any]:
    """
    This function sends the data to Gemini for organization.
    If image_path is provided, we use Gemini's Vision capabilities which is VERY accurate.
    """
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # 1. Prepare visual/textual input
        # If we have the image, we send it directly to Gemini. 
        # This solves the "messy OCR" problem because the AI sees the layout itself.
        prompt_with_instructions = create_prompt(ocr_output)
        
        content_items = [prompt_with_instructions]
        
        if image_path:
            img = Image.open(image_path)
            content_items.append(img)
            print(f"[AI] Calling Gemini Vision ({GEMINI_MODEL}) for high-fidelity extraction...")
        else:
            print(f"[AI] Calling Gemini Text ({GEMINI_MODEL}) for data structuring...")

        # 2. Call the API
        raw_response = model.generate_content(
            content_items,
            generation_config=genai.types.GenerationConfig(
                temperature=GEMINI_TEMPERATURE,
            )
        )
        
        text_result = raw_response.text.strip()
        
        # Clean up Markdown wrapper
        if "```json" in text_result:
            text_result = text_result.split("```json")[1].split("```")[0].strip()
        elif "```" in text_result:
            text_result = text_result.split("```")[1].split("```")[0].strip()
            
        final_data = json.loads(text_result)
        
        print("[AI] Data extracted successfully from image context.")
        return final_data
        
    except json.JSONDecodeError:
        print("[AI ERROR] Gemini didn't return valid JSON.")
        raise Exception("Failed to parse AI response into JSON.")
        
    except Exception as e:
        print(f"[AI ERROR] Gemini API call failed: {str(e)}")
        raise Exception(f"AI Extraction Error: {str(e)}")
