import React from 'react';
import { GameState } from '../types';
import { Zap, Wallet, RotateCw, ShieldCheck } from 'lucide-react';
import { MAX_LEVEL, LEVEL_SCALING_FACTOR } from '../constants';

interface HeaderProps {
  gameState: GameState;
  isTimeSynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({ gameState, isTimeSynced }) => {
  // Calculate Progress to next level
  const currentLevel = gameState.level;
  const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);
  
  // Inverse level calc to find money thresholds
  const currentLevelReq = Math.pow(currentLevel - 1, 2) * LEVEL_SCALING_FACTOR;
  const nextLevelReq = Math.pow(currentLevel, 2) * LEVEL_SCALING_FACTOR;
  
  const progressPercent = currentLevel === MAX_LEVEL 
    ? 100 
    : Math.min(100, Math.max(0, ((gameState.money - currentLevelReq) / (nextLevelReq - currentLevelReq)) * 100));

  return (
    <header className="bg-slate-800 border-b border-slate-700 p-3 sticky top-0 z-30 shadow-xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <h1 className="text-sm font-bold text-slate-400 uppercase tracking-wider hidden sm:block">My Solar Farm</h1>
                    {isTimeSynced && (
                        <div title="Server Time Synced" className="absolute -right-4 -top-1 text-green-500">
                            <ShieldCheck size={12} />
                        </div>
                    )}
                </div>
                <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">Lvl {gameState.level}</span>
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-solar-500 to-yellow-300 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    {gameState.level === MAX_LEVEL && <span className="text-[10px] text-red-400 animate-pulse font-bold">MAX</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {gameState.rebirthLevel > 0 && (
                    <div className="hidden sm:flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        <RotateCw size={14} />
                        <span className="text-xs font-bold">x{gameState.multiplier.toFixed(1)}</span>
                    </div>
                )}
                
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-solar-400">
                        <Wallet size={16} />
                        <span className="text-lg font-bold font-mono tracking-tight">
                        {Math.floor(gameState.money).toLocaleString('en-US')} $
                        </span>
                    </div>
                    <div className="flex items-center gap-1 justify-end text-tech-500 text-xs">
                        <Zap size={12} />
                        <span className="font-mono">
                        +{Math.floor(gameState.totalProductionRate * gameState.multiplier).toLocaleString()}/s
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};