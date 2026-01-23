import './ProgressTracker.css';

function ProgressTracker({ progress }) {
    const steps = [
        { id: 1, label: 'Uploading', threshold: 0 },
        { id: 2, label: 'OCR Extraction', threshold: 25 },
        { id: 3, label: 'AI Analysis', threshold: 50 },
        { id: 4, label: 'Structuring Data', threshold: 75 }
    ];

    return (
        <div className="progress-tracker fade-in">
            <div className="progress-card glass">
                <h3 className="progress-title">Processing Marksheet</h3>

                <div className="steps-container">
                    {steps.map((step) => {
                        const isCompleted = progress > step.threshold;
                        const isActive = progress === step.threshold + 25 || (progress === 100 && step.id === 4);

                        return (
                            <div key={step.id} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                <div className="step-node">
                                    {isCompleted ? (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <span className="step-label">{step.label}</span>
                                {step.id < 4 && <div className="step-line"></div>}
                            </div>
                        );
                    })}
                </div>

                <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="progress-percentage">{progress}%</span>
                </div>
            </div>
        </div>
    );
}

export default ProgressTracker;
