import React, { useState } from 'react';
import { Compass, Smartphone } from 'lucide-react';
import { DownloadAppModal } from './DownloadAppModal';

export const Header: React.FC = () => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-950">
                RouteWise
              </span>
              <span className="text-[11px] font-medium text-zinc-400">
                Pune
              </span>
            </div>
          </div>

          {/* Actions & Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-md transition-colors shadow-2xs"
              title="Download Android APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Get APK</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200/80 bg-zinc-50/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[11px]">Pune Multimodal Transit</span>
            </div>
          </div>

        </div>
      </header>

      <DownloadAppModal 
        isOpen={showDownloadModal} 
        onClose={() => setShowDownloadModal(false)} 
      />
    </>
  );
};
