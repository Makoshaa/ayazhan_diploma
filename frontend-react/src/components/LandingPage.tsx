import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Eye, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Main Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-5"
              >
                <Shield className="w-4 h-4" />
                <span>Protect Confidential Data</span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                Personal Data
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Anonymization
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8">
                Automatic detection and protection of confidential data
                in texts using advanced AI technologies
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={onGetStarted}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </motion.div>

            {/* Right Column - Supported Data Types */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-7"
            >
              <div className="flex items-center gap-2 mb-5">
                <Eye className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-slate-900">
                  Detectable Data Types
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {dataTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.03 }}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">12+</div>
                    <div className="text-sm text-slate-600">Data Types</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">2</div>
                    <div className="text-sm text-slate-600">Languages</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-slate-600">Private</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Zap,
    title: 'Fast Analysis',
    description: 'Instantly',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Reliable Protection',
    description: 'Automatically',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Eye,
    title: 'Visualization',
    description: 'Color Highlighting',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Privacy',
    description: 'Local Only',
    color: 'from-purple-400 to-pink-500',
  },
];

const dataTypes = [
  'Person Names',
  'Phone Numbers',
  'Email',
  'Addresses',
  'ID/Passport',
  'Birth Dates',
  'IP Addresses',
  'Credit Cards',
  'IBAN Codes',
  'Document Numbers',
  'URL Links',
  'Other PII',
];
