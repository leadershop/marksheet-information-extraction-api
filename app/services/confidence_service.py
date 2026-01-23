from typing import Dict, Any

# This service is for trying to quantify how "sure" we are about the results.
# It's not an exact science, but I'm combining OCR confidence and LLM scores.

def calculate_overall_confidence(structured_output: Dict[str, Any], ocr_conf: float) -> float:
    """
    I'm calculating the final score based on 3 things:
    1. How well the OCR read the characters.
    2. What confidence Gemini gave for each field.
    3. Completeness - did we even find the fields we were looking for?
    """
    try:
        field_scores = []
        possible_fields = 0
        found_fields = 0
        
        # 1. Checking Candidate Details
        candidate_info = structured_output.get("candidate_details", {})
        for key, info in candidate_info.items():
            if isinstance(info, dict) and "confidence" in info:
                possible_fields += 1
                field_scores.append(info["confidence"])
                
                # If there's an actual value, we count it as 'found'
                if info.get("value") is not None:
                    found_fields += 1
        
        # 2. Checking Academic Details (Subject rows)
        academic_info = structured_output.get("academic_details", {})
        subject_list = academic_info.get("subjects", [])
        
        for subject_row in subject_list:
            for key, info in subject_row.items():
                if isinstance(info, dict) and "confidence" in info:
                    possible_fields += 1
                    field_scores.append(info["confidence"])
                    if info.get("value") is not None:
                        found_fields += 1
        
        # 3. Checking other Academic summary fields (like Overall Result)
        for key, info in academic_info.items():
            if key != "subjects" and isinstance(info, dict) and "confidence" in info:
                possible_fields += 1
                field_scores.append(info["confidence"])
                if info.get("value") is not None:
                    found_fields += 1
        
        # --- Doing the Math ---
        
        # Average of what Gemini thinks
        avg_llm_score = sum(field_scores) / len(field_scores) if field_scores else 0.0
        
        # How many fields did we actually fill out? 
        # (This helps penalize cases where Gemini just returns null for everything)
        completeness_ratio = found_fields / possible_fields if possible_fields > 0 else 0.0
        
        # Weighted scoring:
        # I decided to give LLM the most weight (50%) because it sees the context.
        # OCR gets 30% because if the raw text is bad, the AI might be guessing.
        # Completeness gets 20% to reward more full extractions.
        
        final_score = (ocr_conf * 0.3) + (avg_llm_score * 0.5) + (completeness_ratio * 0.2)
        
        # Debug prints to see how the weights are behaving
        print(f"[SCORE] OCR: {ocr_conf:.2f}, AI-Avg: {avg_llm_score:.2f}, Completeness: {completeness_ratio:.2f}")
        print(f"[SCORE] Final Result: {final_score:.2f}")
        
        return round(final_score, 2)
        
    except Exception as e:
        print(f"[SCORE ERROR] Calculation failed: {str(e)}")
        # Just return the raw OCR confidence as a fallback
        return round(ocr_conf, 2)
