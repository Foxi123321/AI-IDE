import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Puter.js when available
const initializePuter = async () => {
  try {
    // Wait for Puter.js to be available
    while (!window.puter) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Puter.js initialized successfully');
    
    // Check authentication status
    const isSignedIn = window.puter.auth.isSignedIn();
    console.log('Authentication status:', isSignedIn);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Puter.js:', error);
    return false;
  }
};

// Start the application
const startApp = async () => {
  // Hide loading screen
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // Initialize React app
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

// Initialize everything
initializePuter().then((success) => {
  if (success) {
    startApp();
  } else {
    // Show error message if Puter.js fails to initialize
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.innerHTML = `
        <div style="color: #f85149; text-align: center;">
          <h2>Failed to initialize Puter.js</h2>
          <p>Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()" style="
            background: #238636; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin-top: 16px;
          ">
            Retry
          </button>
        </div>
      `;
    }
  }
});