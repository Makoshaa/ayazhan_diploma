import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export default function Notification({ message, type }: NotificationProps) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm z-50',
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      )}
    >
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}
