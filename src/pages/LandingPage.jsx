import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import {
  Timer,
  TrendingUp,
  Target,
  BarChart3,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  Moon,
  Sun,
  Download,
  Coffee,
  X,
  Smartphone,
  Globe,
  Monitor
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const LandingPage = () => {
  const { theme, toggleTheme } = useThemeStore();
  const controls = useAnimation();
  const [stats, setStats] = useState({
    sessions: 25000,
    hours: 500000,
    satisfaction: 98,
    rating: 4.9
  });

  // PWA Installation State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    // Get user agent for browser-specific instructions
    setUserAgent(navigator.userAgent);

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      setIsAlreadyInstalled(isInstalled);
      console.log('[PWA] App already installed?', isInstalled);

      // Also check for other indicators
      if (window.navigator.standalone) {
        setIsAlreadyInstalled(true);
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] beforeinstallprompt event fired');
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Log for debugging
      console.log('[PWA] App is installable, deferredPrompt saved');
    };

    // Listen for appinstalled event
    const handleAppInstalled = (e) => {
      console.log('[PWA] App was installed via appinstalled event');
      setIsInstallable(false);
      setIsAlreadyInstalled(true);
      setDeferredPrompt(null);
      setShowInstallInstructions(false);

      // Show success message
      setTimeout(() => {
        alert('🎉 FocusFlow has been successfully installed! You can now find it in your apps.');
      }, 500);
    };

    // Listen for changes in display mode
    const handleDisplayModeChange = (e) => {
      console.log('[PWA] Display mode changed:', e.matches ? 'standalone' : 'browser');
      setIsAlreadyInstalled(e.matches);
    };

    const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)');
    standaloneMediaQuery.addListener(handleDisplayModeChange);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check initially
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      standaloneMediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA] Install button clicked');
    console.log('[PWA] deferredPrompt available?', deferredPrompt !== null);
    console.log('[PWA] isAlreadyInstalled?', isAlreadyInstalled);

    if (isAlreadyInstalled) {
      alert('✅ FocusFlow is already installed on your device!');
      return;
    }

    if (deferredPrompt) {
      console.log('[PWA] Showing install prompt');

      try {
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log(`[PWA] User choice result:`, choiceResult);

        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          setIsInstallable(false);
          setIsAlreadyInstalled(true);
          setShowInstallInstructions(false);

          // Clear the deferredPrompt
          setDeferredPrompt(null);
        } else {
          console.log('[PWA] User dismissed the install prompt');
          // Keep the deferredPrompt for later use
          // Show instructions as fallback
          setShowInstallInstructions(true);
        }
      } catch (error) {
        console.error('[PWA] Error during installation:', error);
        // Fallback to instructions
        setShowInstallInstructions(true);
      }
    } else {
      console.log('[PWA] No deferred prompt available, showing instructions');
      // If PWA installation is not available, show instructions
      setShowInstallInstructions(true);
    }
  };

  const checkInstallCapability = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasPrompt = deferredPrompt !== null;
    const canInstall = hasPrompt && !isStandalone;

    return canInstall;
  };

  // Determine user's browser for instructions
  const getBrowserInfo = () => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return { name: 'Chrome', icon: <Monitor className="w-5 h-5" /> };
    if (ua.includes('safari') && !ua.includes('chrome')) return { name: 'Safari', icon: <Globe className="w-5 h-5" /> };
    if (ua.includes('firefox')) return { name: 'Firefox', icon: <Globe className="w-5 h-5" /> };
    if (ua.includes('edg')) return { name: 'Edge', icon: <Monitor className="w-5 h-5" /> };
    return { name: 'Browser', icon: <Smartphone className="w-5 h-5" /> };
  };

  const browserInfo = getBrowserInfo();

  useEffect(() => {
    // Animate stats counting up
    const timer = setTimeout(() => {
      setStats({
        sessions: 25347,
        hours: 512345,
        satisfaction: 98,
        rating: 4.9
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Background animation
    controls.start({
      background: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      ],
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse"
      }
    });
  }, [controls]);

  const features = [
    {
      icon: <Timer className="w-6 h-6" />,
      title: "Smart Timer",
      description: "Pomodoro, custom intervals, and auto-break scheduling",
      highlights: ["Pomodoro Technique", "Custom Intervals", "Auto-breaks"]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Visual insights into your focus patterns and productivity",
      highlights: ["Daily Reports", "Weekly Trends", "Focus Heatmaps"]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal Tracking",
      description: "Set and achieve daily, weekly, and monthly focus goals",
      highlights: ["Smart Goals", "Progress Tracking", "Achievements"]
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Streak System",
      description: "Build consistent habits with our gamified streak system",
      highlights: ["Daily Streaks", "Milestones", "Rewards"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Progress Insights",
      description: "AI-powered insights to optimize your focus sessions",
      highlights: ["AI Analysis", "Productivity Tips", "Pattern Detection"]
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "PWA Support",
      description: "Install as a native app with full offline functionality",
      highlights: ["Offline Mode", "Push Notifications", "Desktop App"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Your data stays on your device. No cloud tracking.",
      highlights: ["Local Storage", "No Tracking", "Open Source"]
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Session History",
      description: "Review past sessions with detailed timestamps and notes",
      highlights: ["Session Logs", "Notes", "Export Data"]
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Software Engineer",
      content: "FocusFlow doubled my daily productive hours. The analytics helped me understand my peak focus times.",
      avatar: "AC",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "PhD Student",
      content: "The goal tracking and streak system kept me motivated through my dissertation writing.",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Marcus Lee",
      role: "Entrepreneur",
      content: "As a startup founder, FocusFlow helps me manage my chaotic schedule with precision.",
      avatar: "ML",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* PWA Installation Instructions Modal */}
      {showInstallInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Install FocusFlow
                </h3>
              </div>
              <button
                onClick={() => setShowInstallInstructions(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  For the best experience, install FocusFlow as an app!
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {browserInfo.icon}
                  <span className="font-medium text-gray-800 dark:text-white">
                    Using {browserInfo.name}?
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Chrome/Edge Instructions */}
                  {(browserInfo.name === 'Chrome' || browserInfo.name === 'Edge') && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Look for the <span className="font-semibold text-blue-600 dark:text-blue-400">install icon</span> in your address bar:
                          </p>
                          <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
                              <Download size={14} />
                              <span className="text-sm">Install</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">2</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Or click the <span className="font-semibold">three dots menu</span> → <span className="font-semibold">"Install FocusFlow"</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Safari Instructions */}
                  {browserInfo.name === 'Safari' && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Tap the <span className="font-semibold text-blue-600 dark:text-blue-400">Share button</span> (📤) at the bottom
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">2</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Scroll and select <span className="font-semibold">"Add to Home Screen"</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Firefox Instructions */}
                  {browserInfo.name === 'Firefox' && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Click the <span className="font-semibold text-blue-600 dark:text-blue-400">three lines menu</span> in the top right
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">2</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Select <span className="font-semibold">"Install"</span> or look for the install button in the address bar
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Generic Instructions */}
                  {!['Chrome', 'Edge', 'Safari', 'Firefox'].includes(browserInfo.name) && (
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Look for an <span className="font-semibold">install button</span> in your browser's address bar or menu
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">2</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Check your browser's menu for <span className="font-semibold">"Add to Home Screen"</span> or <span className="font-semibold">"Install App"</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="inline w-4 h-4 text-green-500 mr-2" />
                    Once installed, FocusFlow works offline and feels like a native app!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInstallInstructions(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-colors font-medium"
              >
                Maybe Later
              </button>
              {deferredPrompt && !isAlreadyInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 
                           text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25
                           transition-all flex items-center justify-center space-x-2"
                >
                  <Download size={18} />
                  <span>Install Now</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={controls}
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute top-1/4 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="relative px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Timer className="text-white w-7 h-7" />
            </motion.div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FocusFlow
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">Pro Productivity</div>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                       border border-gray-200/50 dark:border-gray-700/50
                       hover:border-blue-500/50 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Install Button in Navbar (only show if installable) */}
            {checkInstallCapability() && !isAlreadyInstalled && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleInstallClick}
                className="group relative px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                         text-white font-semibold rounded-lg overflow-hidden transition-all 
                         duration-300 hover:shadow-lg hover:shadow-green-500/25 flex items-center space-x-2"
              >
                <Download size={16} className="group-hover:animate-bounce" />
                <span>Install App</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                />
              </motion.button>
            )}

            <Link
              to="/timer"
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                       text-white font-semibold rounded-xl overflow-hidden transition-all 
                       duration-300 hover:shadow-xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                <span>Launch App</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-12 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 mb-8"
            >
              <Sparkles size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Join 50,000+ productive users
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Focus Like Never
              </span>
              <span className="block text-gray-800 dark:text-white">Before</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              The ultimate productivity suite with intelligent timer, detailed analytics,
              goal tracking, and AI-powered insights to transform how you work and study.
              <span className="block mt-2 text-green-600 dark:text-green-400 font-medium">
                100% Free • No Sign-up Required • Privacy Focused
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/timer"
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 
                         text-white text-lg font-semibold rounded-xl overflow-hidden
                         hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Timer className="w-6 h-6 group-hover:animate-pulse" />
                  <span>Start Free Session</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <motion.div
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500"
                />
              </Link>

              <Link
                to="/analytics"
                className="px-8 py-4 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                         text-gray-800 dark:text-white rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50
                         hover:bg-white dark:hover:bg-gray-800 hover:border-blue-500/50
                         transition-all duration-300 flex items-center space-x-3 group"
              >
                <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Explore Features</span>
              </Link>

              <button
                onClick={handleInstallClick}
                className="group relative px-6 py-4 text-lg bg-transparent text-gray-600 dark:text-gray-400 
                         rounded-xl border-2 border-dashed border-gray-300/50 dark:border-gray-600/50
                         hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400
                         hover:bg-white/50 dark:hover:bg-gray-800/50
                         transition-all duration-300 flex items-center space-x-3"
              >
                <Download className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>
                  {isAlreadyInstalled ? 'App Installed ✓' : 'Install App'}
                </span>
                {checkInstallCapability() && !isAlreadyInstalled && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                  />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
              Completely free • No credit card required • Start instantly
              {checkInstallCapability() && !isAlreadyInstalled && (
                <span className="ml-2 text-blue-500 font-medium">
                  • Install available!
                </span>
              )}
            </p>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          >
            {[
              { icon: <Zap />, label: "Sessions", value: stats.sessions, suffix: "+" },
              { icon: <Clock />, label: "Hours", value: stats.hours, suffix: "+" },
              { icon: <Users />, label: "Satisfaction", value: stats.satisfaction, suffix: "%" },
              { icon: <Star />, label: "Rating", value: stats.rating, suffix: "/5" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 
                         border border-gray-200/50 dark:border-gray-700/50
                         hover:border-blue-500/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                    <div className="text-blue-500 dark:text-blue-400">{stat.icon}</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    <motion.span
                      key={stat.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {stat.value.toLocaleString()}{stat.suffix}
                    </motion.span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Packed with Powerful Features
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to master your time and boost productivity. All features are completely free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                           rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50
                           hover:border-blue-500/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 
                               rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle size={12} className="text-white" />
                  </div>

                  <div className="p-3 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                               dark:from-blue-500/20 dark:to-purple-500/20 mb-4">
                    <div className="text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {feature.description}
                  </p>

                  <div className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Loved by Productivity Enthusiasts
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands who transformed their workflow with our free tool
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 
                           border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 
                                 flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle className="inline w-4 h-4 mr-1 text-green-500" />
                    Uses the free version
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="relative rounded-3xl overflow-hidden mb-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 
                         dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-12 
                         border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center max-w-3xl mx-auto">
                <Coffee className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  Ready to Boost Your Productivity?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Join thousands of students, professionals, and creators who use FocusFlow to
                  stay focused, track progress, and achieve their goals. Everything is completely free!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/timer"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                             text-white text-lg font-semibold rounded-xl hover:shadow-2xl 
                             hover:shadow-purple-500/30 transition-all duration-300
                             flex items-center justify-center space-x-3"
                  >
                    <span>Start Your First Session</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <button
                    onClick={handleInstallClick}
                    className="group px-8 py-4 text-lg bg-transparent text-gray-700 dark:text-gray-300 
                             rounded-xl border-2 border-gray-300/50 dark:border-gray-600/50
                             hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400
                             hover:bg-white/50 dark:hover:bg-gray-800/50
                             transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>
                      {isAlreadyInstalled ? 'App Installed ✓' : 'Install App'}
                    </span>
                    {checkInstallCapability() && !isAlreadyInstalled && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-blue-500 rounded-full ml-2"
                      />
                    )}
                  </button>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center">
                    <Shield className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Privacy Focused</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">100% Free Forever</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">No Sign-up Required</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-8 border-t border-gray-200/50 dark:border-gray-700/50 
                       bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg 
                             flex items-center justify-center">
                  <Timer className="text-white w-6 h-6" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                                 bg-clip-text text-transparent">
                    FocusFlow
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()}</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Master your time, amplify your focus. Built with ❤️ for productive people. Completely free.
              </p>
              <div className="mt-3">
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 
                           hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Download size={14} />
                  <span>Install as PWA</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Product</h4>
                <div className="space-y-2">
                  {['Features', 'Download', 'API', 'Changelog'].map((item) => (
                    <a key={item} href="#" className="block text-gray-600 dark:text-gray-400 
                                                     hover:text-blue-600 dark:hover:text-blue-400">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Resources</h4>
                <div className="space-y-2">
                  {['Documentation', 'Blog', 'Support', 'Community'].map((item) => (
                    <a key={item} href="#" className="block text-gray-600 dark:text-gray-400 
                                                     hover:text-blue-600 dark:hover:text-blue-400">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Legal</h4>
                <div className="space-y-2">
                  {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                    <a key={item} href="#" className="block text-gray-600 dark:text-gray-400 
                                                     hover:text-blue-600 dark:hover:text-blue-400">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Connect</h4>
                <div className="space-y-2">
                  {['Twitter', 'GitHub', 'Discord', 'Email'].map((item) => (
                    <a key={item} href="#" className="block text-gray-600 dark:text-gray-400 
                                                     hover:text-blue-600 dark:hover:text-blue-400">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 
                         text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              FocusFlow is open-source software licensed under MIT.
              Made with coffee ☕ and good vibes. Always free, forever.
            </p>
            <p className="mt-2 flex items-center justify-center space-x-1">
              <Sparkles size={12} />
              <span>PWA supported - Install for offline use and native app experience</span>
              <Sparkles size={12} />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;