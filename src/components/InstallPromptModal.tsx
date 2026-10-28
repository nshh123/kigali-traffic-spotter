import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { Download, Share, PlusSquare, X, Smartphone, Zap, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptModalProps {
  isDarkMode: boolean;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isDarkMode,
  forceOpen = false,
  onClose: externalOnClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running in standalone PWA mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIos = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isAppleIos);

    // 3. Listen for browser install prompt (Chromium, Chrome Android, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Automatically show the prompt when site loads and app is not installed
      setInternalIsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. On page load: if not installed, trigger prompt
    const timer = setTimeout(() => {
      const dismissedThisSession = sessionStorage.getItem('kigali_install_prompt_dismissed');
      if (!dismissedThisSession && !standaloneMode) {
        setInternalIsOpen(true);
      }
    }, 1000);

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInternalIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isOpen = forceOpen || internalIsOpen;

  const handleClose = () => {
    sessionStorage.setItem('kigali_install_prompt_dismissed', 'true');
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          handleClose();
        }
      } catch (err) {
        console.warn('Installation prompt error:', err);
      }
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      // Desktop / Other: Guide user to browser install option
      alert('To install Kigali Traffic Spotter, click the Install or Add to Home Screen button in your browser address bar.');
    }
  };

  // Do not render anything if already running installed
  if (isStandalone || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overscroll-contain">
      <div
        className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all max-h-[92dvh] flex flex-col overflow-y-auto overscroll-contain ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-700/80 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
      >
        {/* Mobile grab indicator */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-xl border transition-all active:scale-95 ${
            isDarkMode
              ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              : 'bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'
          }`}
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Header & Identity */}
        <div className="flex items-center gap-3.5 pr-8">
          <AppLogo size={48} className="w-12 h-12 rounded-2xl shadow-lg ring-1 ring-white/10 shrink-0" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-0.5">
              <Download className="w-2.5 h-2.5" />
              <span>Free PWA App</span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
              Install Kigali Traffic
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Fast, native-like experience on your device
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-4 space-y-2.5">
          <div
            className={`flex items-start gap-3 p-2.5 rounded-2xl border text-xs ${
              isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/60'
            }`}
          >
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Instant 1-Tap Access & Offline Maps</p>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                Opens full screen with pre-cached Kigali street & hill routes.
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-2.5 rounded-2xl border text-xs ${
              isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200/60'
            }`}
          >
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Live Crowdsourced Spotting</p>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                Report gridlocks, police controls, and road closures in real time.
              </p>
            </div>
          </div>
        </div>

        {/* iOS Step-by-Step Guidance Box */}
        {(isIos || showIosInstructions) && (
          <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
            <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              How to install on iPhone & iPad:
            </p>
            <ol className={`space-y-1.5 pl-1 text-[11px] sm:text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-500">1.</span>
                <span>Tap the Safari <strong>Share</strong> button</span>
                <Share className="w-3.5 h-3.5 inline text-blue-500 shrink-0" />
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-500">2.</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                <PlusSquare className="w-3.5 h-3.5 inline text-emerald-500 shrink-0" />
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-blue-500">3.</span>
                <span>Tap <strong>Add</strong> in the top-right corner</span>
              </li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleClose}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all active:scale-95 text-center ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            Not Now
          </button>

          <button
            onClick={handleInstallClick}
            className="flex-[1.5] py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isIos ? 'Show Install Steps' : 'Install App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
