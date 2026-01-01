import { Outlet, Link } from 'react-router-dom';
import { Receipt, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  return (
    <div className="min-h-screen gradient-warm pattern-dots">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-sand-50/80 border-b border-sand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="p-2 rounded-xl bg-terracotta-500 text-white shadow-lg shadow-terracotta-200"
              >
                <Receipt className="w-5 h-5" />
              </motion.div>
              <div>
                <h1 className="font-display text-xl font-bold text-midnight-900">
                  SplitWise
                </h1>
                <p className="text-xs text-midnight-500 -mt-0.5">
                  Split bills effortlessly
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-100 text-forest-700 text-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">Fair splits, always</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-midnight-400">
            Made with care for friends who dine together
          </p>
        </div>
      </footer>
    </div>
  );
}
