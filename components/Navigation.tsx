import React from 'react';
import { ViewType } from '../types';
import { Icon } from './Icons';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  canRebirth: boolean;
}

const NAV_ITEMS: { id: ViewType; label: string; icon: string }[] = [
  { id: 'FARM', label: 'Grid', icon: 'LayoutGrid' },
  { id: 'INVENTORY', label: 'Inventory', icon: 'Package' },
  { id: 'SHOP', label: 'Shop', icon: 'ShoppingCart' },
  { id: 'CREDITS', label: 'Exchange', icon: 'ArrowRightLeft' },
  { id: 'REBIRTH', label: 'Rebirth', icon: 'RotateCw' },
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, canRebirth }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full p-4 shrink-0">
        <div className="mb-8 px-4 py-2">
            <h1 className="text-xl font-bold text-solar-500 tracking-wide">SOLAR TYCOON</h1>
        </div>
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                currentView === item.id
                  ? 'bg-solar-600 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon name={item.icon} size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'REBIRTH' && canRebirth && (
                <span className="absolute right-2 top-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl">
             <p className="text-xs text-slate-500 text-center">v2.2.0 - Inventory Update</p>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 px-2 py-2 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.3)] safe-area-bottom">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1 min-w-0 relative ${
              currentView === item.id ? 'text-solar-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-full ${currentView === item.id ? 'bg-solar-500/20' : ''}`}>
              <Icon name={item.icon} size={20} />
            </div>
            <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
            {item.id === 'REBIRTH' && canRebirth && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
};
