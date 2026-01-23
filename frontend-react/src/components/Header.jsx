import './Header.css';

function Header({ apiStatus, onRefresh }) {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M8 12h16M8 16h16M8 20h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="logo-text">Marksheet Extractor</span>
                    </div>

                    <div className="header-actions">
                        <div className={`api-status ${apiStatus}`} onClick={onRefresh} title="Click to refresh">
                            <span className="status-dot"></span>
                            <span className="status-text">
                                {apiStatus === 'online' ? 'API Online' :
                                    apiStatus === 'offline' ? 'API Offline' :
                                        'Checking...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
