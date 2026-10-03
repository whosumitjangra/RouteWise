import React from 'react';
import { Smartphone, Download, X, ExternalLink, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const apkDownloadUrl = 'https://github.com/whosumitjangra/RouteWise/releases/download/v1.0.0/RouteWise.apk';
  const releaseUrl = 'https://github.com/whosumitjangra/RouteWise/releases/tag/v1.0.0';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(apkDownloadUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">RouteWise Android APK</h3>
              <p className="text-[11px] text-zinc-500">Standalone offline-capable mobile build</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Download Card */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-950">Release v1.0.0 (Production APK)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    ARM64 / Universal
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-1">
                  Ready-to-install standalone package with full Pune Metro, PMPML bus schedules & offline engine.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <a
                href={apkDownloadUrl}
                download="RouteWise.apk"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download RouteWise.apk</span>
              </a>

              <a
                href={releaseUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                <span>GitHub Release</span>
              </a>
            </div>
          </div>

          {/* Quick Scan & Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center p-3 rounded-xl border border-zinc-200 bg-zinc-50/60">
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-zinc-200/80 shadow-2xs">
              <img 
                src={qrCodeUrl} 
                alt="QR Code to download RouteWise.apk" 
                className="w-24 h-24 rounded"
                loading="lazy"
              />
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mt-1">
                <QrCode className="w-3 h-3 text-zinc-400" />
                <span>Scan with phone</span>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-900 block">3-Step Quick Install:</span>
              <ul className="text-[11px] text-zinc-600 space-y-1.5 list-none pl-0">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1. Download:</strong> Save the APK to your device or scan the QR code.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2. Allow Install:</strong> Tap downloaded notification; if prompted, toggle <em>Allow from this source</em>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3. Run:</strong> Tap Install & enjoy RouteWise right on your home screen!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security & Verification note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 text-[11px] text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Built directly from public repository source via automated GitHub Actions CI. Clean & safe.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Target SDK 34 (Android 14+)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md font-medium text-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
