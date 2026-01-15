import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { EXCHANGE_UNLOCK_COST, ONE_WEEK_MS, CREDIT_CLAIM_COST } from '../constants';
import { ArrowRightLeft, Wallet, TrendingUp, Lock, Unlock, Calendar, CheckCircle } from 'lucide-react';

interface CreditExchangeProps {
  gameState: GameState;
  onClaimCredit: () => void;
  onUnlock: () => void;
  serverTime: number;
}

export const CreditExchange: React.FC<CreditExchangeProps> = ({ gameState, onClaimCredit, onUnlock, serverTime }) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  
  const canAffordCost = gameState.money >= CREDIT_CLAIM_COST;
  const timeSinceLastClaim = serverTime - (gameState.lastCreditClaimTime || 0);
  const isCooldownOver = timeSinceLastClaim >= ONE_WEEK_MS;

  useEffect(() => {
    if (!isCooldownOver) {
        const interval = setInterval(() => {
            const remaining = ONE_WEEK_MS - (serverTime - (gameState.lastCreditClaimTime || 0));
            if (remaining <= 0) {
                setTimeLeftStr("Available Now");
            } else {
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeftStr(`${days}d ${hours}h ${minutes}m`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [serverTime, gameState.lastCreditClaimTime, isCooldownOver]);

  if (!gameState.isExchangeUnlocked) {
      const canUnlock = gameState.money >= EXCHANGE_UNLOCK_COST;
      return (
        <div className="p-6 max-w-xl mx-auto mt-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Exchange Locked</h2>
                <p className="text-slate-400 mb-6">
                    Unlock the Credit Exchange to process large financial transactions.
                </p>
                <div className="bg-slate-900/50 p-4 rounded-xl mb-6 inline-block w-full">
                    <p className="text-xs text-slate-500 uppercase font-bold">Unlock Cost</p>
                    <p className={`text-2xl font-mono font-bold ${canUnlock ? 'text-green-400' : 'text-red-400'}`}>
                        {EXCHANGE_UNLOCK_COST.toLocaleString()} $
                    </p>
                </div>
                <button 
                    onClick={onUnlock}
                    disabled={!canUnlock}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                        ${canUnlock 
                            ? 'bg-solar-600 hover:bg-solar-500 text-white shadow-lg shadow-solar-500/20 active:scale-95' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }
                    `}
                >
                    <Unlock size={20} />
                    {canUnlock ? 'Unlock System' : 'Insufficient Funds'}
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Credit Exchange</h2>
        <p className="text-slate-400">Weekly conversion of surplus funds into Credits.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5 text-solar-500 pointer-events-none">
            <TrendingUp size={120} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center mb-8">
            <div className="text-center sm:text-left">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Funds</p>
                <p className="text-2xl font-mono text-white">{Math.floor(gameState.money).toLocaleString()} $</p>
            </div>
            <div className="flex justify-center">
                <div className="bg-slate-700 p-3 rounded-full">
                    <ArrowRightLeft className="text-solar-500" />
                </div>
            </div>
            <div className="text-center sm:text-right">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Energy Credits</p>
                <p className="text-2xl font-mono text-tech-500">{gameState.credits}</p>
            </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700/50">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" />
                    <div>
                        <h4 className="font-bold text-slate-200">Weekly Allowance</h4>
                        <p className="text-xs text-slate-500">1 Credit Withdrawal / Week</p>
                    </div>
                </div>
                {isCooldownOver ? (
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Ready
                    </span>
                ) : (
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                        Cooldown
                    </span>
                )}
             </div>

             <div className="flex justify-between items-center text-sm mb-2 border-t border-slate-800 pt-4">
                <span className="text-slate-400">Transaction Cost</span>
                <span className={`font-mono font-bold ${canAffordCost ? 'text-white' : 'text-red-400'}`}>
                    {CREDIT_CLAIM_COST.toLocaleString()} $
                </span>
             </div>
             {!isCooldownOver && (
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Next Available</span>
                    <span className="text-solar-400 font-mono">{timeLeftStr}</span>
                </div>
             )}
        </div>

        <button 
            onClick={onClaimCredit}
            disabled={!isCooldownOver || !canAffordCost}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2
                ${isCooldownOver && canAffordCost
                    ? 'bg-gradient-to-r from-solar-600 to-orange-600 hover:from-solar-500 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }
            `}
        >
            <Wallet size={20} />
            {isCooldownOver 
                ? (canAffordCost ? 'Claim 1 Weekly Credit' : 'Insufficient Funds') 
                : 'Limit Reached (Wait for Cool down)'
            }
        </button>
        
        <p className="text-xs text-center text-slate-500 mt-4">
            Security Protocol: Only one large transfer is permitted per week to stabilize the economy.
        </p>
      </div>
    </div>
  );
};