const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const extractBtn = document.getElementById('extractBtn');
const resultContainer = document.getElementById('resultContainer');
const jsonOutput = document.getElementById('jsonOutput');
const statusDiv = document.getElementById('status');

const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const confidenceBadge = document.getElementById('confidenceBadge');
const confidenceValue = document.getElementById('confidenceValue');

let lastExtractionData = null;

// Show selected filename
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
        fileNameDisplay.style.color = 'var(--text-primary)';
    } else {
        fileNameDisplay.textContent = 'No file selected';
        fileNameDisplay.style.color = 'var(--text-secondary)';
    }
});

extractBtn.addEventListener('click', async () => {
    if (!fileInput.files[0]) {
        alert('Please select a file first.');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // Loading State
    extractBtn.disabled = true;
    extractBtn.textContent = 'Extracting...';
    statusDiv.textContent = 'Processing could take a few seconds...';
    resultContainer.classList.add('hidden');
    confidenceBadge.classList.add('hidden');
    jsonOutput.textContent = '';
    lastExtractionData = null;

    try {
        const response = await fetch('/extract', {
            method: 'POST',
            headers: {
                // Hardcoded for demo/student project simplicity
                'X-API-KEY': 'marksheet-ai-secret-key'
            },
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || `Error: ${response.statusText}`);
        }

        const data = await response.json();
        lastExtractionData = data;

        statusDiv.textContent = 'Done!';

        // Show Confidence
        if (data.overall_confidence !== undefined) {
            const percentage = (data.overall_confidence * 100).toFixed(1) + '%';
            confidenceValue.textContent = percentage;
            confidenceBadge.classList.remove('hidden');
        }

        // --- Populate Parsed Results ---
        const candidateGrid = document.getElementById('candidateGrid');
        const marksBody = document.getElementById('marksBody');

        // Clear previous
        candidateGrid.innerHTML = '';
        marksBody.innerHTML = '';

        // Helper function to safely get value from the nested {value: "...", confidence: ...} structure
        const getValue = (field) => {
            if (field && typeof field === 'object' && field.value !== undefined) {
                return field.value || '-';
            }
            return field || '-';
        };

        // 1. Candidate Details
        if (data.candidate_details) {
            for (const [key, fieldData] of Object.entries(data.candidate_details)) {
                const displayValue = getValue(fieldData);
                // Only show fields that have a value
                if (displayValue !== '-' && displayValue !== null) {
                    const item = document.createElement('div');
                    item.className = 'info-item';
                    item.innerHTML = `
                        <span class="info-label">${key.replace(/_/g, ' ')}</span>
                        <span class="info-value">${displayValue}</span>
                    `;
                    candidateGrid.appendChild(item);
                }
            }
        }

        // 2. Marks Table
        let subjects = [];
        if (data.academic_details && Array.isArray(data.academic_details.subjects)) {
            subjects = data.academic_details.subjects;
        }

        if (subjects.length > 0) {
            subjects.forEach(sub => {
                const row = document.createElement('tr');

                // Extract values using the helper
                const name = getValue(sub.subject);
                const marks = getValue(sub.obtained_marks);
                const max = getValue(sub.max_marks);
                const grade = getValue(sub.grade);

                // Construct marks display (e.g. "80 / 100")
                const marksDisplay = (max !== '-') ? `${marks} / ${max}` : marks;

                row.innerHTML = `
                    <td>${name}</td>
                    <td>${marksDisplay}</td>
                    <td>${grade}</td>
                `;
                marksBody.appendChild(row);
            });
        } else {
            marksBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No subjects found in extraction.</td></tr>';
        }

        // Pretty print JSON
        jsonOutput.textContent = JSON.stringify(data, null, 2);
        resultContainer.classList.remove('hidden');

    } catch (error) {
        statusDiv.textContent = 'Failed to extract.';
        console.error(error);
        alert('An error occurred: ' + error.message);
    } finally {
        extractBtn.disabled = false;
        extractBtn.textContent = 'Extract Information';
    }
});

// Copy Feature
copyBtn.addEventListener('click', () => {
    if (!lastExtractionData) return;
    navigator.clipboard.writeText(JSON.stringify(lastExtractionData, null, 2));
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
});

// Download Feature
downloadBtn.addEventListener('click', () => {
    if (!lastExtractionData) return;
    const blob = new Blob([JSON.stringify(lastExtractionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marksheet_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
