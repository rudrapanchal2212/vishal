import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function InstallAppButton({ className = "", variant = "button" }) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);

  useEffect(() => {
    // Check standalone mode on mount
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
      setIsInstalled(!!isStandalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallHelp(false);
    }
  };

  const handleDownloadApk = () => {
    // Trigger download of the APK file
    const link = document.createElement('a');
    link.href = '/vishal-app.apk';
    link.download = 'Vishal-App.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isInstalled && variant !== 'landing') return null;

  return (
    <>
      {variant === 'landing' ? (
        <div className={`w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white flex items-center justify-between gap-3 shadow-xl ${className}`}>
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9994.4482.9994.9993 0 .5511-.4483.9997-.9994.9997m11.4045-6.02l1.996-3.4568a.4158.4158 0 00-.1523-.5676.416.416 0 00-.5684.1523l-2.0223 3.503C15.5898 8.411 13.849 8.09 12 8.09c-1.8494 0-3.5899.321-5.1309.8623L4.8468 5.4493a.4162.4162 0 00-.5684-.1523.4158.4158 0 00-.1523.5676l1.996 3.4568C2.688 10.973.5 14.5807.5 18.75h23c0-4.1693-2.188-7.777-5.6185-9.4286"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                Android App Available
                <span className="bg-emerald-400/30 text-emerald-300 text-[10px] font-semibold px-1.5 py-0.2 rounded-full border border-emerald-400/40">APK</span>
              </p>
              <p className="text-xs text-primary-200 mt-0.5">Download for phone with all features</p>
            </div>
          </div>
          <button
            onClick={() => setShowInstallHelp(true)}
            className="px-3.5 py-2 bg-white text-primary-700 hover:bg-primary-50 active:scale-95 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInstallHelp(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex-shrink-0 ${className}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download App
        </button>
      )}

      {/* Download / Install Options Modal */}
      <Modal
        isOpen={showInstallHelp}
        onClose={() => setShowInstallHelp(false)}
        title="Download Vishal App"
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-slate-300 text-left">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Use the Android APK for full native performance, or add the Web App directly to your home screen.
          </p>

          {/* Option 1: Android APK Download */}
          <div className="border-2 border-primary-500/30 bg-primary-50/50 dark:bg-primary-900/10 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9994.4482.9994.9993 0 .5511-.4483.9997-.9994.9997m11.4045-6.02l1.996-3.4568a.4158.4158 0 00-.1523-.5676.416.416 0 00-.5684.1523l-2.0223 3.503C15.5898 8.411 13.849 8.09 12 8.09c-1.8494 0-3.5899.321-5.1309.8623L4.8468 5.4493a.4162.4162 0 00-.5684-.1523.4158.4158 0 00-.1523.5676l1.996 3.4568C2.688 10.973.5 14.5807.5 18.75h23c0-4.1693-2.188-7.777-5.6185-9.4286"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    Android APK (Direct Install)
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Version 1.0 &middot; 8.3 MB &middot; Ready for Android
                  </p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-slate-300 mb-3">
              Directly install the app on your Android phone. Fully offline capable, fast PDF generation and invoice sharing.
            </p>

            <a
              href="/vishal-app.apk"
              download="Vishal-App.apk"
              onClick={handleDownloadApk}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm shadow-md"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Android APK
            </a>

            <button
              type="button"
              onClick={() => setShowAndroidSteps(!showAndroidSteps)}
              className="text-[11px] text-primary-600 dark:text-primary-400 font-medium hover:underline mt-2 inline-flex items-center gap-1"
            >
              {showAndroidSteps ? 'Hide installation steps' : 'How to install the APK on Android?'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-3 h-3 transition-transform ${showAndroidSteps ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showAndroidSteps && (
              <div className="mt-2.5 pt-2.5 border-t border-primary-200/50 dark:border-primary-800/40 text-xs text-gray-600 dark:text-slate-300 space-y-1.5">
                <p><strong>1.</strong> Tap <strong>Download Android APK</strong> above.</p>
                <p><strong>2.</strong> Once downloaded, tap the notification or open your <em>Downloads</em> folder.</p>
                <p><strong>3.</strong> Tap <strong>Install</strong>. If your browser asks permission, tap <em>Settings &rarr; Allow from this source</em>.</p>
                <p><strong>4.</strong> Open Vishal App and start managing your invoices!</p>
              </div>
            )}
          </div>

          {/* Option 2: Add to Home Screen (PWA) */}
          <div className="border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30 p-4 rounded-2xl">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 flex items-center justify-between">
              <span>Web App (Add to Home Screen)</span>
              <span className="text-[10px] text-gray-500 font-normal">iOS & Android</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              Add the web app directly to your home screen without downloading an APK file.
            </p>

            {deferredPrompt ? (
              <button
                onClick={handlePwaInstall}
                className="w-full py-2 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                Add to Home Screen (Instant)
              </button>
            ) : (
              <div className="space-y-2 text-xs text-gray-600 dark:text-slate-300">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                  <p className="font-semibold text-gray-800 dark:text-white mb-0.5">iPhone / iPad (Safari):</p>
                  <p>Tap Share (box with arrow) &rarr; select <strong>Add to Home Screen</strong> &rarr; tap Add.</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                  <p className="font-semibold text-gray-800 dark:text-white mb-0.5">Chrome / Edge / Firefox:</p>
                  <p>Tap browser <strong>&vellip; (three dots)</strong> &rarr; select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowInstallHelp(false)}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
