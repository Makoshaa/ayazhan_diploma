import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import Settings from './components/Settings';
import ControlPanel from './components/ControlPanel';
import TextInput from './components/TextInput';
import ResultPanel from './components/ResultPanel';
import Notification from './components/Notification';
import { analyzeText, anonymizeText } from './api';
import { validatePIIWithClaude } from './claude';
import type { PIIResult } from './types';

function App() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [language, setLanguage] = useState<'en' | 'ru'>('en');
  const [inputText, setInputText] = useState('My name is Maria Anders and my phone number is (206) 555-0100.');
  const [piiResults, setPiiResults] = useState<PIIResult[]>([]);
  const [anonymizedText, setAnonymizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useClaude, setUseClaude] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // If user is authenticated and on landing/login/register, redirect to app
  if (isAuthenticated && currentView !== 'app') {
    setCurrentView('app');
  }

  // Show landing page
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }

  // Show login page
  if (currentView === 'login') {
    return (
      <Login
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  // Show register page
  if (currentView === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  // If not authenticated but trying to access app, redirect to login
  if (!isAuthenticated && currentView === 'app') {
    setCurrentView('login');
    return null;
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      showNotification('Enter text to analyze', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Анализ
      let results = await analyzeText({
        text: inputText,
        language,
        score_threshold: 0.01,
      });

      // Валидация с помощью Claude (если включено)
      if (useClaude) {
        showNotification('Validating with Claude AI...', 'success');
        try {
          results = await validatePIIWithClaude(inputText, results, language);
        } catch (claudeError: any) {
          console.error('Claude validation failed:', claudeError);
          const errorMessage = claudeError?.message || 'Claude validation failed';
          showNotification(errorMessage, 'error');
          // Продолжаем с результатами Presidio
        }
      }

      setPiiResults(results);

      // Обезличивание
      if (results.length > 0) {
        const anonymized = await anonymizeText({
          text: inputText,
          analyzer_results: results,
          anonymizers: {
            DEFAULT: {
              type: 'replace',
              new_value: '<REDACTED>',
            },
          },
        });

        setAnonymizedText(anonymized);
        const claudeNote = useClaude ? ' (Claude validated)' : '';
        showNotification(`Processed successfully. Found ${results.length} PII items${claudeNote}`);
      } else {
        setAnonymizedText(inputText);
        showNotification('No personal data detected');
      }
    } catch (error) {
      showNotification((error as Error).message, 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    // Очищаем результаты при изменении текста
    if (text !== inputText) {
      setPiiResults([]);
      setAnonymizedText('');
    }
  };

  const handleCopy = async () => {
    if (!anonymizedText) {
      showNotification('No result to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(anonymizedText);
      showNotification('Result copied to clipboard');
    } catch (error) {
      showNotification('Error copying', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSettingsClick={() => setShowSettings(!showSettings)}
        onHomeClick={() => setCurrentView('landing')}
      />

      <Settings 
        isOpen={showSettings} 
        useClaude={useClaude}
        onClaudeToggle={setUseClaude}
      />

      <ControlPanel
        language={language}
        onLanguageChange={setLanguage}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        onTextExtracted={handleTextChange}
      />

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TextInput
            value={inputText}
            onChange={handleTextChange}
            piiResults={piiResults}
          />

          <ResultPanel
            anonymizedText={anonymizedText}
            piiResults={piiResults}
            originalText={inputText}
            onCopy={handleCopy}
          />
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
