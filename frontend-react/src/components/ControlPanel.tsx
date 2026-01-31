import { Languages, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUpload from './FileUpload';

interface ControlPanelProps {
  language: 'en' | 'ru';
  onLanguageChange: (lang: 'en' | 'ru') => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onTextExtracted: (text: string) => void;
}

export default function ControlPanel({
  language,
  onLanguageChange,
  onAnalyze,
  isLoading,
  onTextExtracted,
}: ControlPanelProps) {
  return (
    <div className="max-w-[1800px] mx-auto w-full px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <FileUpload onTextExtracted={onTextExtracted} />

        <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
          <Languages className="w-4 h-4 text-slate-500" />
          <label htmlFor="language" className="text-xs font-medium text-slate-600">
            Text Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as 'en' | 'ru')}
            className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="ru">Russian (RU)</option>
          </select>
        </div>

        <motion.button
          onClick={onAnalyze}
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Analyze</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
