import React from 'react';
import { MAX_LEVEL } from '../constants';
import { Icon } from './Icons';

interface RebirthNotificationProps {
  level: number;
  onGoToRebirth: () => void;
}

export const RebirthNotification: React.FC<RebirthNotificationProps> = ({ level, onGoToRebirth }) => {
  if (level < MAX_LEVEL) return null;

  return (
    <div 
      onClick={onGoToRebirth}
      className="fixed bottom-20 md:bottom-6 right-4 z-50 cursor-pointer animate-pulse-slow group"
    >
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-white/20 flex items-center gap-4 transition-transform transform hover:scale-105 active:scale-95">
        
        {/* Glowing effect behind */}
        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-30 animate-pulse rounded-xl"></div>
        
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <Icon name="RotateCw" className="animate-spin-slow" size={24} />
        </div>
        
        <div className="relative">
          <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">Rebirth Ready!</h3>
          <p className="text-xs text-purple-100 font-medium">Max Level Reached. Production Halted.</p>
        </div>

        <div className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded shadow-sm">
          GO
        </div>
      </div>
    </div>
  );
};