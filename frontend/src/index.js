/**
 * BoilerExam Frontend Entry Point
 * 
 * Renders the main App component into the root DOM element
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);