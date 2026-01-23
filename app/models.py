from typing import Optional, List
from pydantic import BaseModel, Field

# Using Pydantic models to make sure our JSON output always follows the same format.
# This makes it much easier for the frontend to display the data.

class FieldWithConfidence(BaseModel):
    # Every extracted piece of data comes with a confidence score (0.0 to 1.0)
    # This helps us tell the user how sure we are about the value.
    value: Optional[str] = Field(None, description="The actual text we found")
    confidence: float = Field(..., ge=0.0, le=1.0, description="How confident we are in this specific field")

class SubjectMarks(BaseModel):
    # Model for a single subject row on the marksheet
    subject: FieldWithConfidence
    max_marks: FieldWithConfidence
    obtained_marks: FieldWithConfidence
    grade: Optional[FieldWithConfidence] = None  # Not all marksheets show grades

class CandidateDetails(BaseModel):
    # Personal details about the student. 
    # I made these Optional because some boards don't show Father's name or DOB on marksheets.
    name: Optional[FieldWithConfidence] = None
    father_name: Optional[FieldWithConfidence] = None
    mother_name: Optional[FieldWithConfidence] = None
    roll_number: Optional[FieldWithConfidence] = None
    registration_number: Optional[FieldWithConfidence] = None
    date_of_birth: Optional[FieldWithConfidence] = None
    exam_year: Optional[FieldWithConfidence] = None
    board_university: Optional[FieldWithConfidence] = None
    institution: Optional[FieldWithConfidence] = None

class AcademicDetails(BaseModel):
    # Overall summary and list of subjects
    subjects: List[SubjectMarks] = Field(default_factory=list)
    overall_result: Optional[FieldWithConfidence] = None
    overall_grade: Optional[FieldWithConfidence] = None
    division: Optional[FieldWithConfidence] = None  # E.g. First Division, Second Division
    issue_date: Optional[FieldWithConfidence] = None
    issue_place: Optional[FieldWithConfidence] = None

class ExtractionResponse(BaseModel):
    # This is the final JSON object the API returns
    candidate_details: CandidateDetails
    academic_details: AcademicDetails
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    
    # Adding an example so developers can see what to expect in Swagger
    class Config:
        json_schema_extra = {
            "example": {
                "candidate_details": {
                    "name": {"value": "MAYANK SAHU", "confidence": 0.98},
                    "roll_number": {"value": "2023001", "confidence": 1.0}
                },
                "academic_details": {
                    "subjects": [
                        {
                            "subject": {"value": "Physics", "confidence": 0.95},
                            "obtained_marks": {"value": "88", "confidence": 0.98},
                            "max_marks": {"value": "100", "confidence": 1.0}
                        }
                    ],
                    "overall_result": {"value": "PASS", "confidence": 0.99}
                },
                "overall_confidence": 0.96
            }
        }

class ErrorResponse(BaseModel):
    # To keep error messages consistent
    error: str
    detail: Optional[str] = None
