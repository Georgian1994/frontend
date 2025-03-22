// src/App.js
import React from 'react';
import './App.css';
import TranslationApp from './components/TranslationApp';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Translation SaaS</h1>
        <p className="App-subtitle">Translate text in real-time with DeepL API</p>
      </header>
      <main className="App-main">
        <TranslationApp />
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Translation SaaS - MVP Version</p>
      </footer>
    </div>
  );
}

export default App;