import { Lock, Settings, Home, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSettingsClick: () => void;
  onHomeClick?: () => void;
}

export default function Header({ onSettingsClick, onHomeClick }: HeaderProps) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Personal Data Anonymization
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Automatic detection and protection of confidential information
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user.username}</span>
              </div>
            )}
            {onHomeClick && (
              <motion.button
                onClick={onHomeClick}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Home"
              >
                <Home className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              onClick={onSettingsClick}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={logout}
              className="p-2 rounded-lg bg-white/20 hover:bg-red-500/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
