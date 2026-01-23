// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const extractBtn = document.getElementById('extractBtn');
const btnText = document.getElementById('btnText');
const btnIcon = document.getElementById('btnIcon');
const spinner = document.getElementById('spinner');
const progressContainer = document.getElementById('progressContainer');
const resultsSection = document.getElementById('resultsSection');
const confidenceValue = document.getElementById('confidenceValue');
const candidateDetails = document.getElementById('candidateDetails');
const academicDetails = document.getElementById('academicDetails');
const jsonContent = document.getElementById('jsonContent');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const toggleJsonBtn = document.getElementById('toggleJson');

let selectedFile = null;
let extractionResult = null;

// File Upload Handlers
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearFile();
});

function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid file (PDF, JPG, or PNG)');
        return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
    }

    selectedFile = file;

    // Update UI
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    uploadPlaceholder.style.display = 'none';
    filePreview.style.display = 'flex';
    extractBtn.disabled = false;
}

function clearFile() {
    selectedFile = null;
    fileInput.value = '';
    uploadPlaceholder.style.display = 'block';
    filePreview.style.display = 'none';
    extractBtn.disabled = true;
    progressContainer.style.display = 'none';
    resultsSection.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Extract Button Handler
extractBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show progress
    progressContainer.style.display = 'block';
    resultsSection.style.display = 'none';

    // Update button state
    extractBtn.disabled = true;
    btnText.textContent = 'Processing...';
    btnIcon.style.display = 'none';
    spinner.style.display = 'block';

    // Simulate progress steps
    await simulateProgress();

    // Call API
    try {
        const result = await extractMarksheet(selectedFile);
        extractionResult = result;
        displayResults(result);
    } catch (error) {
        alert('Extraction failed: ' + error.message);
        console.error('Error:', error);
    } finally {
        // Reset button state
        extractBtn.disabled = false;
        btnText.textContent = 'Extract Data';
        btnIcon.style.display = 'block';
        spinner.style.display = 'none';
    }
});

async function simulateProgress() {
    const steps = ['step1', 'step2', 'step3', 'step4'];

    for (let i = 0; i < steps.length; i++) {
        const step = document.getElementById(steps[i]);
        step.classList.add('active');

        await new Promise(resolve => setTimeout(resolve, 800));

        step.classList.remove('active');
        step.classList.add('completed');
    }
}

async function extractMarksheet(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Extraction failed');
    }

    return await response.json();
}

function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Display overall confidence
    const confidence = Math.round(data.overall_confidence * 100);
    confidenceValue.textContent = confidence + '%';

    // Update confidence badge color
    const badge = document.getElementById('confidenceBadge');
    badge.style.background = getConfidenceColor(data.overall_confidence, 0.1);
    badge.style.borderColor = getConfidenceColor(data.overall_confidence, 0.3);

    // Display candidate details
    candidateDetails.innerHTML = '';
    if (data.candidate_details) {
        Object.entries(data.candidate_details).forEach(([key, field]) => {
            if (field && field.value) {
                candidateDetails.appendChild(createResultItem(
                    formatFieldName(key),
                    field.value,
                    field.confidence
                ));
            }
        });
    }

    // Display academic details
    academicDetails.innerHTML = '';
    if (data.academic_details) {
        // Overall academic info
        ['overall_result', 'overall_grade', 'division', 'issue_date', 'issue_place'].forEach(key => {
            const field = data.academic_details[key];
            if (field && field.value) {
                academicDetails.appendChild(createResultItem(
                    formatFieldName(key),
                    field.value,
                    field.confidence
                ));
            }
        });

        // Subjects
        if (data.academic_details.subjects && data.academic_details.subjects.length > 0) {
            const subjectsHeader = document.createElement('div');
            subjectsHeader.style.marginTop = '20px';
            subjectsHeader.style.marginBottom = '12px';
            subjectsHeader.style.fontWeight = '600';
            subjectsHeader.style.color = 'var(--primary-light)';
            subjectsHeader.textContent = 'Subject-wise Marks';
            academicDetails.appendChild(subjectsHeader);

            data.academic_details.subjects.forEach((subject, index) => {
                const subjectCard = document.createElement('div');
                subjectCard.style.marginBottom = '16px';
                subjectCard.style.padding = '16px';
                subjectCard.style.background = 'rgba(15, 23, 42, 0.5)';
                subjectCard.style.borderRadius = '8px';
                subjectCard.style.border = '1px solid rgba(99, 102, 241, 0.1)';

                const subjectName = document.createElement('div');
                subjectName.style.fontWeight = '600';
                subjectName.style.marginBottom = '8px';
                subjectName.textContent = subject.subject?.value || `Subject ${index + 1}`;
                subjectCard.appendChild(subjectName);

                const marksInfo = document.createElement('div');
                marksInfo.style.fontSize = '14px';
                marksInfo.style.color = 'var(--gray-400)';
                marksInfo.innerHTML = `
                    Obtained: <span style="color: white; font-weight: 600;">${subject.obtained_marks?.value || 'N/A'}</span> / 
                    Max: <span style="color: white; font-weight: 600;">${subject.max_marks?.value || 'N/A'}</span>
                    ${subject.grade?.value ? ` | Grade: <span style="color: white; font-weight: 600;">${subject.grade.value}</span>` : ''}
                `;
                subjectCard.appendChild(marksInfo);

                academicDetails.appendChild(subjectCard);
            });
        }
    }

    // Display JSON
    jsonContent.textContent = JSON.stringify(data, null, 2);
}

function createResultItem(label, value, confidence) {
    const item = document.createElement('div');
    item.className = 'result-item';

    const labelEl = document.createElement('div');
    labelEl.className = 'result-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'result-value';

    const valueText = document.createElement('span');
    valueText.textContent = value;
    valueEl.appendChild(valueText);

    if (confidence !== undefined) {
        const confEl = document.createElement('span');
        confEl.className = 'confidence-indicator ' + getConfidenceClass(confidence);
        confEl.textContent = Math.round(confidence * 100) + '%';
        valueEl.appendChild(confEl);
    }

    item.appendChild(labelEl);
    item.appendChild(valueEl);

    return item;
}

function formatFieldName(key) {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
}

function getConfidenceColor(confidence, alpha) {
    if (confidence >= 0.8) return `rgba(16, 185, 129, ${alpha})`;
    if (confidence >= 0.5) return `rgba(245, 158, 11, ${alpha})`;
    return `rgba(239, 68, 68, ${alpha})`;
}

// Copy JSON Button
copyBtn.addEventListener('click', () => {
    if (!extractionResult) return;

    const jsonText = JSON.stringify(extractionResult, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10L8 13L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });
});

// Download JSON Button
downloadBtn.addEventListener('click', () => {
    if (!extractionResult) return;

    const jsonText = JSON.stringify(extractionResult, null, 2);
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `marksheet-extraction-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Toggle JSON Viewer
toggleJsonBtn.addEventListener('click', () => {
    const content = jsonContent;
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleJsonBtn.querySelector('svg').style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        toggleJsonBtn.querySelector('svg').style.transform = 'rotate(0deg)';
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Check API health on load
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            console.log('✅ API is running and healthy');
        } else {
            console.warn('⚠️ API health check failed');
        }
    } catch (error) {
        console.error('❌ Cannot connect to API. Make sure the server is running on http://localhost:8000');
    }
}

checkAPIHealth();
