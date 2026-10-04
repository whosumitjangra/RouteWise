import React from 'react';
import { 
  Home, 
  Bookmark, 
  Clock, 
  Settings, 
  Leaf, 
  MapPin,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'home',
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved Places', icon: Bookmark },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between p-5
        transform transition-transform duration-200 ease-in-out shrink-0
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top: Brand Logo & Navigation */}
        <div className="space-y-7">
          
          {/* Logo Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0d5c46] flex items-center justify-center text-white shadow-xs">
                {/* BudWay pin icon with dot inside */}
                <div className="relative flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white fill-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1.5"></div>
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-zinc-900 tracking-tight leading-tight">
                  BudWay
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium tracking-tight">
                  Better Routes. Smarter Choices.
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            {isOpenMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab?.(item.id);
                    onCloseMobile?.();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left
                    ${isActive 
                      ? 'bg-[#e8f5e9] text-[#0d5c46] shadow-2xs font-bold' 
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0d5c46]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Tip Card: "Travel smarter" */}
        <div className="bg-[#f0fdf4] border border-[#d1fae5] rounded-2xl p-3.5 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#0d5c46]">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900">
              Travel smarter
            </h4>
            <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
              Choose the best route for your budget and time.
            </p>
          </div>
        </div>

      </aside>
    </>
  );
};
