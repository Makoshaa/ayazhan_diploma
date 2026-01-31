import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { PIIResult } from '../types';
import { ENTITY_TYPE_LABELS } from '../types';

interface PIIListProps {
  results: PIIResult[];
  originalText: string;
}

export default function PIIList({ results, originalText }: PIIListProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3">Detected Data</h3>
      <div className="flex flex-col gap-2">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={clsx(
              'bg-slate-50 p-3 rounded-lg border-l-4 hover:bg-slate-100 transition-colors',
              getBorderColor(result.entity_type)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">
                {ENTITY_TYPE_LABELS[result.entity_type] || result.entity_type}
              </span>
              <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded">
                Confidence: {(result.score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="font-mono text-xs text-slate-600 bg-white px-2 py-1.5 rounded">
              {originalText.substring(result.start, result.end)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getBorderColor(entityType: string): string {
  const colors = {
    PERSON: 'border-pii-person',
    PHONE_NUMBER: 'border-pii-phone',
    EMAIL_ADDRESS: 'border-pii-email',
    LOCATION: 'border-pii-location',
    DATE_TIME: 'border-pii-date',
    IIN: 'border-red-600',
    BIN: 'border-orange-600',
    ID_CARD: 'border-amber-600',
    SSN: 'border-pink-600',
    CREDIT_CARD: 'border-rose-600',
  };

  return colors[entityType as keyof typeof colors] || 'border-pii-default';
}
