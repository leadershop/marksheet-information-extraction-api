import { useState } from 'react';
import './Results.css';

function Results({ data }) {
    const [showJson, setShowJson] = useState(false);

    const getConfidenceColor = (conf) => {
        if (conf >= 0.8) return 'var(--success)';
        if (conf >= 0.5) return 'var(--warning)';
        return 'var(--error)';
    };

    const getConfidenceClass = (conf) => {
        if (conf >= 0.8) return 'high';
        if (conf >= 0.5) return 'medium';
        return 'low';
    };

    const formatKey = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        alert('JSON copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marksheet-data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        if (!data.academic_details?.subjects) return;

        const headers = ["Subject", "Obtained Marks", "Max Marks", "Grade", "Confidence"];
        const rows = data.academic_details.subjects.map(s => [
            s.subject?.value || "",
            s.obtained_marks?.value || "",
            s.max_marks?.value || "",
            s.grade?.value || "",
            `${Math.round(s.subject?.confidence * 100)}%`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marksheet-results.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section id="results" className="results-section slide-up">
            <div className="results-header">
                <h2 className="section-title">Extraction Results</h2>
                <div className="overall-confidence-badge" style={{
                    background: `rgba(${data.overall_confidence >= 0.8 ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                    borderColor: getConfidenceColor(data.overall_confidence)
                }}>
                    <span className="badge-label">Overall Confidence</span>
                    <span className="badge-value" style={{ color: getConfidenceColor(data.overall_confidence) }}>
                        {Math.round(data.overall_confidence * 100)}%
                    </span>
                </div>
                <button className="export-csv-btn" onClick={handleExportCSV}>
                    <span className="btn-icon">📊</span> Export CSV
                </button>
            </div>

            <div className="results-grid">
                {/* Candidate Details */}
                <div className="results-card glass">
                    <div className="card-header">
                        <span className="card-icon">👤</span>
                        <h3 className="card-title">Candidate Information</h3>
                    </div>
                    <div className="card-content">
                        {data.candidate_details && Object.entries(data.candidate_details).map(([key, field]) => (
                            field?.value && (
                                <div key={key} className="data-item">
                                    <span className="data-label">{formatKey(key)}</span>
                                    <div className="data-value-wrapper">
                                        <span className="data-value">{field.value}</span>
                                        <span className={`confidence-tag ${getConfidenceClass(field.confidence)}`}>
                                            {Math.round(field.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Academic Summary */}
                <div className="results-card glass">
                    <div className="card-header">
                        <span className="card-icon">🎓</span>
                        <h3 className="card-title">Academic Summary</h3>
                    </div>
                    <div className="card-content">
                        {['overall_result', 'overall_grade', 'division', 'issue_date'].map(key => {
                            const field = data.academic_details?.[key];
                            return field?.value && (
                                <div key={key} className="data-item">
                                    <span className="data-label">{formatKey(key)}</span>
                                    <div className="data-value-wrapper">
                                        <span className="data-value">{field.value}</span>
                                        <span className={`confidence-tag ${getConfidenceClass(field.confidence)}`}>
                                            {Math.round(field.confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Subject-wise Marks */}
            {data.academic_details?.subjects?.length > 0 && (
                <div className="subjects-section glass">
                    <div className="card-header">
                        <span className="card-icon">📚</span>
                        <h3 className="card-title">Subject-wise Performance</h3>
                    </div>
                    <div className="subjects-grid">
                        {data.academic_details.subjects.map((subj, idx) => (
                            <div key={idx} className="subject-card">
                                <div className="subject-name">{subj.subject?.value || `Subject ${idx + 1}`}</div>
                                <div className="subject-marks">
                                    <div className="mark-box">
                                        <span className="mark-label">Obtained</span>
                                        <span className="mark-value">{subj.obtained_marks?.value || '-'}</span>
                                    </div>
                                    <div className="mark-box">
                                        <span className="mark-label">Maximum</span>
                                        <span className="mark-value">{subj.max_marks?.value || '-'}</span>
                                    </div>
                                    {subj.grade?.value && (
                                        <div className="mark-box grade">
                                            <span className="mark-label">Grade</span>
                                            <span className="mark-value">{subj.grade.value}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* JSON Viewer */}
            <div className="json-viewer-container glass">
                <div className="json-header" onClick={() => setShowJson(!showJson)}>
                    <div className="json-title-wrapper">
                        <span className="card-icon">{"{ }"}</span>
                        <h3 className="card-title">Raw JSON Data</h3>
                    </div>
                    <div className="json-actions">
                        {showJson && (
                            <>
                                <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>Copy</button>
                                <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>Download</button>
                            </>
                        )}
                        <svg
                            className={`chevron ${showJson ? 'open' : ''}`}
                            width="20" height="20" viewBox="0 0 20 20" fill="none"
                        >
                            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                {showJson && (
                    <div className="json-content">
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Results;
