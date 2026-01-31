import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy } from 'lucide-react';
import PIIList from './PIIList';
import type { PIIResult } from '../types';

interface ResultPanelProps {
  anonymizedText: string;
  piiResults: PIIResult[];
  originalText: string;
  onCopy: () => void;
}

export default function ResultPanel({
  anonymizedText,
  piiResults,
  originalText,
  onCopy,
}: ResultPanelProps) {
  const hasResults = anonymizedText.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl shadow overflow-hidden flex flex-col min-h-[500px]"
    >
      <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
        <h2 className="text-base font-semibold">Anonymized Result</h2>
        <motion.button
          onClick={onCopy}
          className="p-2 bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Copy Result"
        >
          <Copy className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col overflow-auto">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8"
            >
              <FileText className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Click "Analyze" to see anonymized text</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {anonymizedText}
              </div>

              {piiResults.length > 0 && (
                <div className="border-t">
                  <PIIList results={piiResults} originalText={originalText} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
