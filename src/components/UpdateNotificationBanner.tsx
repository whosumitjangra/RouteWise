import React, { useState } from 'react';
import { ArrowUpCircle, Download, X } from 'lucide-react';
import { UpdateInfo } from '../services/updateChecker';

interface UpdateNotificationBannerProps {
  updateInfo: UpdateInfo | null;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({ updateInfo }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!updateInfo || !updateInfo.hasUpdate || dismissed) {
    return null;
  }

  return (
    <div className="bg-emerald-600 text-white px-4 py-2 text-xs transition-all shadow-sm">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ArrowUpCircle className="w-4 h-4 text-emerald-200 shrink-0 animate-pulse" />
          <span className="font-medium truncate">
            <strong>Update Available:</strong> RouteWise {updateInfo.latestVersion} is out!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={updateInfo.downloadUrl}
            download="RouteWise.apk"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-950 font-bold rounded-md hover:bg-emerald-50 transition-colors shadow-2xs text-[11px]"
          >
            <Download className="w-3 h-3 text-emerald-700" />
            <span>Update Now</span>
          </a>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded transition-colors"
            aria-label="Dismiss update notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
