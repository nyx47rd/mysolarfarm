import React from 'react';
import { GameState } from '../types';
import { REBIRTH_BASE_COST, REBIRTH_MULTIPLIER_STEP, MAX_LEVEL } from '../constants';
import { Icon } from './Icons';

interface RebirthProps {
  gameState: GameState;
  onRebirth: () => void;
}

export const Rebirth: React.FC<RebirthProps> = ({ gameState, onRebirth }) => {
  const nextRebirthCost = REBIRTH_BASE_COST * Math.pow(1.5, gameState.rebirthLevel);
  const canAfford = gameState.money >= nextRebirthCost;
  const isMaxLevel = gameState.level >= MAX_LEVEL;
  const canRebirth = canAfford && isMaxLevel;
  
  const nextMultiplier = 1 + ((gameState.rebirthLevel + 1) * REBIRTH_MULTIPLIER_STEP);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Cosmic Rebirth
        </h2>
        <p className="text-slate-300 max-w-lg mx-auto leading-relaxed">
            Collapse your current timeline to gain cosmic power. 
            <br/>
            <span className="text-red-400 font-bold">Requirement: Level {MAX_LEVEL}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-8">
        {/* Status */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-full">
            <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Prerequisites</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-slate-300">Farm Level</span>
                    <span className={`text-xl font-mono font-bold ${isMaxLevel ? 'text-green-400' : 'text-red-400'}`}>
                        {gameState.level} / {MAX_LEVEL}
                    </span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-slate-300">Cost</span>
                    <span className={`text-xl font-mono font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        {nextRebirthCost.toLocaleString()} $
                    </span>
                </div>
            </div>
            
            {!isMaxLevel && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 text-xs text-center">
                    You must reach Level {MAX_LEVEL} to perform a Rebirth.
                </div>
            )}
        </div>

        {/* Rewards */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-purple-500/30 h-full">
            <h3 className="text-purple-300 text-sm font-bold uppercase mb-4">Rebirth Rewards</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-purple-200">Rebirth Level</span>
                    <span className="text-xl font-mono font-bold text-white">{gameState.rebirthLevel} <span className="text-purple-400 text-sm">→ {gameState.rebirthLevel + 1}</span></span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-purple-200">Production</span>
                    <span className="text-xl font-mono font-bold text-white">x{nextMultiplier.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-purple-200">New Items</span>
                    <span className="text-sm font-bold text-white bg-purple-600 px-2 py-1 rounded">2+ Systems Unlocked</span>
                </div>
                <div className="flex justify-between items-center">
                     <span className="text-purple-200">Bonus Cash</span>
                     <span className="text-green-300 font-mono">+10,000 $</span>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 text-center">
          <button 
            onClick={() => {
                if(confirm("Rebirth will RESET your grid, money, and inventory. Only Credits and Rebirth Level persist. Are you sure?")) {
                    onRebirth();
                }
            }}
            disabled={!canRebirth}
            className={`w-full max-w-md mx-auto py-5 rounded-2xl font-bold text-xl transition-all shadow-xl group
                ${canRebirth 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed grayscale'
                }
            `}
          >
             <span className="flex items-center justify-center gap-3">
                <Icon name="RotateCw" className={canRebirth ? "group-hover:rotate-180 transition-transform duration-700" : ""} />
                {isMaxLevel ? "INITIATE REBIRTH" : "REACH LEVEL 20 FIRST"}
             </span>
          </button>
      </div>
    </div>
  );
};