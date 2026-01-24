---
title: Marksheet Information Extraction API
emoji: 📄
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
---

# 🎓 Marksheet Information Extraction API

Hey there! This is my project for the AI Engineer Intern technical task. I built a tool that takes a photo or PDF of an academic marksheet and turns it into organized JSON data. 

I used **FastAPI** for the backend, **EasyOCR** for reading the text, and **Google Gemini** to help make sense of the messy OCR output.

## 🚀 Why I built it this way

When I started, I realized that every school and university has a totally different marksheet layout. Writing a separate piece of code for each one would be impossible. 

So, I decided on a two-step "OCR + LLM" pipeline:
1. **OCR Stage**: I use EasyOCR to get all the text out of the image first. This is safe because it only reads what's actually there.
2. **AI Stage**: I send that text to Gemini with a prompt that says "find the student's name, their marks, etc." Since Gemini is smart, it can find these things no matter where they are on the page.

**Wait, why not just send the image to AI?**
I tried that! But sometimes the AI would "hallucinate" (make up) roll numbers or names if the image was a bit blurry. By doing OCR first, I make sure the AI is only working with text that we actually found on the paper.

### ✨ New Advanced Features
*   **Visual Grounding (Bounding Boxes)**: The API now returns the exact coordinates (`bounding_box`) for every extracted field. This allows frontends to highlight exactly where the name or marks were found on the original document.
*   **Security (API Key)**: Added a layer of security using an `X-API-KEY` header check.
*   **CSV Export**: One-click export to professional CSV reports from the dashboard.

## 🛠️ How to get it running

### Prerequisites
*   Python 3.8 or higher
*   A Gemini API Key (I got mine for free from [Google AI Studio](https://makersuite.google.com/app/apikey))
*   **Poppler**: If you want to use PDFs on Windows, you'll need this. I downloaded it from [here](https://github.com/oschwartz10612/poppler-windows/releases) and added the `bin` folder to my PATH.

### Setup
1.  **Clone the repo** and open a terminal in the folder.
2.  **Make a virtual environment** (highly recommended):
    ```bash
    python -m venv venv
    venv\Scripts\activate  # On Windows
    ```
3.  **Install the stuff**:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: The first time you run the OCR, it will download some models (about 100MB).*
4.  **Add your API Key**: Create a `.env` file in the main folder and put your key in:
    ```
    GEMINI_API_KEY=your_key_here
    API_KEY=marksheet-ai-secret-key
    ```

### Running it
```bash
python main.py
```
The API should now be live at `http://localhost:8000`.

## 🧪 How to test it
The easiest way is to use the **Swagger UI** that FastAPI builds for you. Just go to `http://localhost:8000` in your browser. You can click "Try it out", upload a marksheet, and see the results!

## 📊 How I calculate the "Confidence Score"
I didn't want to just give back data without saying how sure I am about it. My final score (0.0 to 1.0) is a mix of three things:
1.  **OCR Confidence**: How well the OCR code could read the characters.
2.  **LLM Confidence**: How "sure" Gemini says it is about the fields it found.
3.  **Completeness**: If it missed some important fields (like the roll number), the score goes down.

Basically, if the score is above 0.8, it's usually very reliable!

## 🚧 Known Issues & Trade-offs
*   **Handwriting**: My OCR is mostly for printed text. It might struggle if the teacher wrote the marks by hand.
*   **Multi-page PDFs**: Right now, I'm only processing the first page.
*   **Speed**: Since I'm running this on my laptop's CPU, it takes about 5-8 seconds per marksheet. It would be faster on a GPU.

## 📁 Project Structure (Keeping it simple)
*   `main.py`: Just the starting point.
*   `app/routes.py`: Where the API endpoints live.
*   `app/services/`: This is where the real logic is (OCR, LLM, Scoring).
*   `app/utils/`: Tiny helpers for cleaning text.

## 🔮 Future Ideas
*   Add support for Hindi marksheets.
*   Process all pages of a PDF.
*   Finish the React frontend I started in `frontend-react`.

---
**Build by a student AI Engineer Intern**
Hope this project shows my approach to solving real-world data problems! ✌️
