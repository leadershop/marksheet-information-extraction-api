import { useRef } from 'react';
import './UploadSection.css';

function UploadSection({ selectedFile, onFileSelect, onRemoveFile, onExtract, isProcessing }) {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileValidation(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileValidation(e.target.files[0]);
        }
    };

    const handleFileValidation = (file) => {
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

        onFileSelect(file);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <section className="upload-section slide-up">
            <div className="upload-card glass">
                <h2 className="section-title">Upload Marksheet</h2>
                <p className="section-subtitle">
                    Drag and drop your marksheet file or click to browse
                </p>

                <div
                    className="upload-area"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {!selectedFile ? (
                        <div className="upload-placeholder">
                            <svg className="upload-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
                                <path
                                    d="M32 16V48M16 32H48"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                                <rect
                                    x="8"
                                    y="8"
                                    width="48"
                                    height="48"
                                    rx="8"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray="8 8"
                                />
                            </svg>
                            <p className="upload-text">Click or drag file here</p>
                            <p className="upload-hint">Supports PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                    ) : (
                        <div className="file-preview">
                            <div className="file-icon">
                                {selectedFile.type === 'application/pdf' ? '📄' : '🖼️'}
                            </div>
                            <div className="file-info">
                                <p className="file-name">{selectedFile.name}</p>
                                <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <button
                                className="remove-file-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile();
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M5 5L15 15M5 15L15 5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="extract-btn"
                    onClick={onExtract}
                    disabled={!selectedFile || isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <span className="spinner"></span>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M10 3V17M10 17L15 12M10 17L5 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>Extract Data</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}

export default UploadSection;
