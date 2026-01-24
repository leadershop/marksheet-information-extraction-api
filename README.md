# 🎓 Marksheet AI: Intelligent Information Extraction

[![Deploy to HF](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/MAyAnkkkkSaHu/marksheet-extraction-api)
[![Backend Docs](https://img.shields.io/badge/API-Swagger-green)](https://mayankkkksahu-marksheet-extraction-api.hf.space/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade AI solution that transforms academic marksheets (images/PDFs) into structured, validated JSON data. Built with a hybrid **OCR + Vision LLM** pipeline for maximum accuracy and cross-board compatibility.

---

### 🌐 Live Deployment
*   **Live Demo (Frontend + API):** [https://huggingface.co/spaces/MAyAnkkkkSaHu/marksheet-extraction-api](https://huggingface.co/spaces/MAyAnkkkkSaHu/marksheet-extraction-api)
*   **Interactive API Documentation:** [https://mayankkkksahu-marksheet-extraction-api.hf.space/docs](https://mayankkkksahu-marksheet-extraction-api.hf.space/docs)
*   **API Base URL:** ``[https://mayankkkksahu-marksheet-extraction-api.hf.space/](https://mayankkkksahu-marksheet-extraction-api.hf.space/)

---

### ✨ Key Features

*   **⚡ Hybrid Extraction Pipeline**: Combines `EasyOCR` for high-fidelity character recognition with `Google Gemini 1.5 Flash` for intelligent layout understanding.
*   **📍 Visual Grounding**: Returns precise `bounding_box` coordinates for every extracted field to allow UI highlighting.
*   **📊 Multi-Weighted Confidence**: A sophisticated scoring system based on OCR quality, LLM probability, and document completeness.
*   **🔐 Enterprise Ready**: Implementation of `X-API-KEY` security and stateless processing for data privacy.
*   **📉 Real-world Robustness**: Specifically tuned for complex table structures and watermarked academic documents.
*   **📤 Data Portability**: One-click **CSV Export** and raw JSON download directly from the dashboard.

---

### 🛠️ Technical Architecture

#### The "Vision-First" Philosophy
Standard OCR often fails on complex marksheets due to varied layouts. Our approach uses a **Two-Pass Strategy**:
1.  **Direct Vision**: The original image is passed to a Vision-capable LLM to understand the spatial relationship between labels and scores.
2.  **OCR Grounding**: The raw text is cross-referenced with OCR metadata to normalize values and extract coordinates.

#### Tech Stack
- **Backend**: Python, FastAPI
- **AI Core**: Google Gemini 1.5 Flash (API), EasyOCR
- **Frontend**: React.js, Vite, Glassmorphism CSS
- **DevOps**: Docker, Hugging Face Spaces

---

### 🚀 Local Setup

#### Prerequisites
- Python 3.9+
- A Google Gemini API Key ([Get it here](https://aistudio.google.com/))
- Poppler (for PDF support on Windows)

#### Installation
```bash
# 1. Clone & Enter
git clone https://github.com/MayankSahu297/marksheet-information-extraction-api.git
cd marksheet-information-extraction-api

# 2. Virtual Environment
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows

# 3. Dependencies
pip install -r requirements.txt
```

#### Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key_here
API_KEY=marksheet-ai-secret-key  # Used for X-API-KEY header
```

#### Run
```bash
python main.py
```
*API will be available at `http://localhost:8000`*

---

### 📄 Approach Note & Logic
Detailed reasoning on confidence scoring, prompt engineering, and architectural trade-offs can be found in the [APPROACH.md](./APPROACH.md) file.

---

### 🤝 Author
**Mayank Sahu**  
*AI Engineer Intern Candidate*  
[GitHub](https://github.com/MayankSahu297) | [LinkedIn](https://www.linkedin.com/in/mayank-sahu-587224318/)

---
<p align="center">Built with ❤️ for real-world document automation.</p>
