import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import ProgressTracker from './components/ProgressTracker';
import Results from './components/Results';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractionResult, setExtractionResult] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiStatus('online');
        console.log('✅ API is running and healthy');
      } else {
        setApiStatus('offline');
        console.warn('⚠️ API health check failed');
      }
    } catch (error) {
      setApiStatus('offline');
      console.error('❌ Cannot connect to API. Make sure the server is running on http://localhost:8000');
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setExtractionResult(null);
    setProgress(0);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExtractionResult(null);
    setProgress(0);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setExtractionResult(null);

    // Simulate progress
    const progressSteps = [25, 50, 75, 100];
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(progressSteps[i]);
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: {
          'X-API-KEY': 'marksheet-ai-secret-key'
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Extraction failed');
      }

      const result = await response.json();
      setExtractionResult(result);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    } catch (error) {
      alert('Extraction failed: ' + error.message);
      console.error('Error:', error);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <Header apiStatus={apiStatus} onRefresh={checkAPIHealth} />
      <Hero />
      <main className="container">
        <UploadSection
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onExtract={handleExtract}
          isProcessing={isProcessing}
        />

        {isProcessing && (
          <ProgressTracker progress={progress} />
        )}

        {extractionResult && (
          <Results data={extractionResult} />
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>Built with ❤️ using React.js & FastAPI</p>
          <p className="footer-subtitle">Marksheet Information Extraction API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
