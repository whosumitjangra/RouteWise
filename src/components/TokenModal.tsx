import React from 'react';
import { X, Key, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { hasValidMapboxToken } from '../services/mapbox';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isLive = hasValidMapboxToken();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-zinc-950">
              Mapbox Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isLive 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-zinc-50 border-zinc-200 text-zinc-900'
        }`}>
          {isLive ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <strong className="block font-semibold mb-0.5">
              {isLive ? 'Mapbox Live API Connected' : 'Pune Offline Engine Active'}
            </strong>
            <p className="text-zinc-500 leading-relaxed">
              {isLive
                ? 'High-resolution vector road tiles and live traffic geocoding are enabled.'
                : 'IndiaRide includes a built-in spatial routing engine and verified Pune landmarks dictionary, so the app is 100% interactive even without a key!'}
            </p>
          </div>
        </div>

        {/* How to add token */}
        <div className="space-y-2 text-xs text-zinc-600">
          <h4 className="font-semibold text-zinc-900">
            How to enable Live Mapbox Tiles:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-zinc-600">
            <li>
              Sign up for free at{' '}
              <a
                href="https://account.mapbox.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                account.mapbox.com <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              (100k free requests/month, no credit card required).
            </li>
            <li>Copy your public token (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">pk.eyJ...</code>).</li>
            <li>Paste it inside your <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">.env</code> file:</li>
          </ol>

          <pre className="p-3 bg-zinc-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto">
            VITE_MAPBOX_TOKEN=pk.eyJ1I...
          </pre>

          <p className="text-[11px] text-zinc-400 italic">
            Public tokens are safe in frontend code and can be restricted to your domain in the Mapbox console.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-zinc-950 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Got it
        </button>

      </div>
    </div>
  );
};
