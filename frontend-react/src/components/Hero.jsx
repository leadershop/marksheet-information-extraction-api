import './Hero.css';

function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">
                        <span className="gradient-text">AI-Powered</span>
                        <br />
                        Marksheet Extraction
                    </h1>
                    <p className="hero-subtitle">
                        Extract structured data from marksheets with confidence scores using OCR and LLM technology
                    </p>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-value">95%+</div>
                            <div className="stat-label">Accuracy</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-value">&lt;10s</div>
                            <div className="stat-label">Processing</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔒</div>
                            <div className="stat-value">100%</div>
                            <div className="stat-label">Secure</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated background elements */}
            <div className="hero-bg">
                <div className="bg-circle bg-circle-1"></div>
                <div className="bg-circle bg-circle-2"></div>
                <div className="bg-circle bg-circle-3"></div>
            </div>
        </section>
    );
}

export default Hero;
