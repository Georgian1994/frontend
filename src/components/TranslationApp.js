// src/components/TranslationApp.js
import React, { useState, useEffect } from 'react';
import './TranslationApp.css';

const TranslationApp = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLanguages, setSourceLanguages] = useState([]);
  const [targetLanguages, setTargetLanguages] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  
  // API endpoint
  const API_URL = 'https://backend-production-7d30f.up.railway.app/api';
  
  // Fetch languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        // Fetch source languages
        console.log('Fetching source languages from API...');
        const sourceResponse = await fetch(`${API_URL}/source-languages`);
        
        if (!sourceResponse.ok) {
          console.error('Failed to fetch source languages:', sourceResponse.statusText);
          throw new Error('Failed to fetch source languages');
        }
        
        const sourceData = await sourceResponse.json();
        console.log('Source languages fetched successfully:', sourceData);
        setSourceLanguages(sourceData);
        
        // Fetch target languages
        console.log('Fetching target languages from API...');
        const targetResponse = await fetch(`${API_URL}/target-languages`);
        
        if (!targetResponse.ok) {
          console.error('Failed to fetch target languages:', targetResponse.statusText);
          throw new Error('Failed to fetch target languages');
        }
        
        const targetData = await targetResponse.json();
        console.log('Target languages fetched successfully:', targetData);
        setTargetLanguages(targetData);
        
        // Set initial target language (English or Romanian if available)
        if (targetData.some(lang => lang.language === 'ro')) {
          setTargetLanguage('ro');
        } else if (targetData.some(lang => lang.language === 'en')) {
          setTargetLanguage('en');
        } else if (targetData.length > 0) {
          setTargetLanguage(targetData[0].language);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
        // Use fallback languages if API call fails
        setSourceLanguages([
          { language: 'auto', name: 'Detect language' },
          { language: 'en', name: 'English' },
          { language: 'ro', name: 'Romanian' },
          { language: 'es', name: 'Spanish' },
          { language: 'fr', name: 'French' },
          { language: 'de', name: 'German' }
        ]);
        
        setTargetLanguages([
          { language: 'en', name: 'English' },
          { language: 'ro', name: 'Romanian' },
          { language: 'es', name: 'Spanish' },
          { language: 'fr', name: 'French' },
          { language: 'de', name: 'German' }
        ]);
        
        setTargetLanguage('ro'); // Default to Romanian
      }
    };
    
    fetchLanguages();
  }, []);

  // Translate text using the API
  const translateText = async (text, source, target) => {
    if (!text) {
      setTranslatedText('');
      setDetectedLanguage('');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Translating text from ${source} to ${target}:`, text.substring(0, 30) + (text.length > 30 ? '...' : ''));
      
      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang: source,
          targetLang: target,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Translation failed:', errorData);
        throw new Error(errorData.error || 'Translation failed');
      }
      
      const data = await response.json();
      console.log('Translation successful:', data);
      
      setTranslatedText(data.translation);
      if (source === 'auto' && data.detectedLanguage) {
        setDetectedLanguage(data.detectedLanguage);
      } else {
        setDetectedLanguage('');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || 'Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce function to prevent too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      translateText(inputText, sourceLanguage, targetLanguage);
    }, 500); // Slightly faster response time with Azure

    return () => {
      clearTimeout(handler);
    };
  }, [inputText, sourceLanguage, targetLanguage]);

  // Get language name from code
  const getSourceLanguageName = (code) => {
    if (code === 'auto') return 'Detect language';
    const language = sourceLanguages.find(lang => lang.language === code);
    return language ? language.name : code;
  };
  
  const getTargetLanguageName = (code) => {
    const language = targetLanguages.find(lang => lang.language === code);
    return language ? language.name : code;
  };
  
  // Find a language object by its name (for swapping purposes)
  const findLanguageByName = (languages, name) => {
    return languages.find(lang => lang.name === name);
  };

  // Swap languages
  const handleSwapLanguages = () => {
    // Don't swap if source is auto-detect
    if (sourceLanguage === 'auto') return;
    
    // Get language names
    const sourceName = getSourceLanguageName(sourceLanguage);
    const targetName = getTargetLanguageName(targetLanguage);
    
    // Find corresponding language objects in the other list
    const newSourceLang = findLanguageByName(sourceLanguages, targetName)?.language || sourceLanguage;
    const newTargetLang = findLanguageByName(targetLanguages, sourceName)?.language || targetLanguage;
    
    // Swap the text
    const newInputText = translatedText;
    const newTranslatedText = inputText;
    
    // Update state
    setSourceLanguage(newSourceLang);
    setTargetLanguage(newTargetLang);
    setInputText(newInputText);
    setTranslatedText(newTranslatedText);
  };

  return (
    <div className="translation-container">
      <div className="language-controls">
        <div className="language-selectors">
          <select
            className="language-select"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {sourceLanguages.map((lang) => (
              <option key={`source-${lang.language}`} value={lang.language}>
                {lang.name}
              </option>
            ))}
          </select>

          <button 
            className="swap-button"
            onClick={handleSwapLanguages}
            disabled={sourceLanguage === 'auto'}
            title={sourceLanguage === 'auto' ? "Can't swap when using auto-detect" : "Swap languages"}
          >
            ⇄
          </button>

          <select
            className="language-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {targetLanguages.map((lang) => (
              <option key={`target-${lang.language}`} value={lang.language}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="translation-box">
        <div className="input-section">
          <div className="header">
            <label>
              {sourceLanguage === 'auto' && detectedLanguage && (
                <span className="detected-language">
                  Detected: {getSourceLanguageName(detectedLanguage)}
                </span>
              )}
            </label>
            <button 
              className="clear-button"
              onClick={() => setInputText('')}
              disabled={!inputText}
            >
              ✕
            </button>
          </div>
          <textarea
            className="text-area"
            placeholder="Type or paste text here to translate..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </div>
        
        <div className="output-section">
          <div className="header">
            <button 
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(translatedText);
                alert('Copied to clipboard!');
              }}
              disabled={!translatedText}
            >
              Copy
            </button>
          </div>
          <div className="translation-result">
            {isLoading ? (
              <div className="loading">Translating...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : (
              <div className="translated-text">{translatedText}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="footer">
        <p>This application uses the Azure Translator API for translation. Start typing to see real-time translations.</p>
      </div>
    </div>
  );
};

export default TranslationApp;