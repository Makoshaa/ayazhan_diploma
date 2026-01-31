import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getClaudeApiKey, setClaudeApiKey } from '../claude';

interface SettingsProps {
  isOpen: boolean;
  useClaude: boolean;
  onClaudeToggle: (enabled: boolean) => void;
}

export default function Settings({ isOpen, useClaude, onClaudeToggle }: SettingsProps) {
  const [claudeKey, setClaudeKeyState] = useState('');

  useEffect(() => {
    setClaudeKeyState(getClaudeApiKey());
  }, [isOpen]);

  const handleClaudeKeyChange = (value: string) => {
    setClaudeKeyState(value);
    setClaudeApiKey(value);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-3">Connection Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-600">Analyzer URL</span>
                    <input
                      type="text"
                      defaultValue="http://localhost:3000"
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-600">Anonymizer URL</span>
                    <input
                      type="text"
                      defaultValue="http://localhost:3001"
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-base font-semibold mb-3">🤖 AI Enhancement</h3>
                
                <div className="mb-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-600">Claude API Key</span>
                    <input
                      type="password"
                      value={claudeKey}
                      onChange={(e) => handleClaudeKeyChange(e.target.value)}
                      placeholder="sk-ant-..."
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Using Claude 4 Sonnet - the most advanced AI model. Default key is included, but you can use your own from{' '}
                      <a 
                        href="https://console.anthropic.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        Anthropic Console
                      </a>
                    </p>
                  </label>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useClaude}
                    onChange={(e) => onClaudeToggle(e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-700">
                      Enable Claude AI Validation
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Use Claude 4 Sonnet to validate and improve PII detection accuracy. Specially tuned for Kazakhstan data (ИИН, БИН, etc). More accurate than standard models.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
