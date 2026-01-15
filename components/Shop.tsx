import React from 'react';
import { ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Icon } from './Icons';

interface ShopProps {
  money: number;
  inventory: Record<string, number>;
  shopStock: Record<string, number>;
  onBuy: (item: ShopItem, quantity: number) => void;
  onSelectItem: (item: ShopItem) => void;
  selectedItem: ShopItem | null;
  nextRefreshTime: number;
  rebirthLevel: number;
}

export const Shop: React.FC<ShopProps> = ({ money, inventory, shopStock, onBuy, onSelectItem, selectedItem, nextRefreshTime, rebirthLevel }) => {
  
  const minutesLeft = Math.ceil((nextRefreshTime - Date.now()) / 60000);
  
  // Filter items visible based on rebirth level
  const visibleItems = SHOP_ITEMS.filter(item => item.requiredRebirth <= rebirthLevel);
  // Optional: Show next tier locked items for preview? For now, let's keep them hidden for surprise factor.

  return (
    <div className="p-4 sm:p-6 pb-24 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Energy Market</h2>
            <p className="text-slate-400">Buy systems to add to your inventory. Some items require Rebirth to unlock.</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
            <Icon name="RotateCw" size={16} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">Restock in: ~{minutesLeft > 0 ? minutesLeft : 1} min</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {visibleItems.map((item) => {
          const ownedCount = inventory[item.id] || 0;
          const currentStock = shopStock[item.id] ?? item.maxStock;
          const isSelected = selectedItem?.id === item.id;
          
          const canAffordOne = money >= item.price;
          const canAffordFive = money >= item.price * 5;
          const hasStockOne = currentStock >= 1;
          const hasStockFive = currentStock >= 5;

          return (
            <div
              key={item.id}
              className={`
                relative flex flex-col p-4 rounded-2xl border transition-all duration-200 aspect-square sm:aspect-auto
                ${isSelected 
                  ? 'border-solar-500 bg-slate-800 ring-1 ring-solar-500' 
                  : 'border-slate-700 bg-slate-800/50'
                }
                ${currentStock === 0 ? 'opacity-75 grayscale-[0.5]' : ''}
              `}
            >
               {item.requiredRebirth > 0 && (
                   <div className="absolute top-2 right-2 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                       Rebirth {item.requiredRebirth} Item
                   </div>
               )}

              {/* Header */}
              <div className="flex justify-between items-start mb-3 mt-4 sm:mt-0">
                <div className={`p-3 rounded-xl ${item.color} bg-opacity-20`}>
                  <Icon name={item.iconName} className={isSelected ? 'text-solar-500' : 'text-slate-300'} size={24} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Cost</div>
                  <span className={`block text-lg font-mono font-bold ${canAffordOne ? 'text-white' : 'text-red-400'}`}>
                    {item.price.toLocaleString()} $
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-100">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-3 line-clamp-2 min-h-[2.5em]">{item.description}</p>
              
              {/* Stats & Inventory */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                 <div className="bg-slate-900/50 p-2 rounded-lg flex items-center gap-1 text-tech-500 text-xs font-mono">
                    <Icon name="Zap" size={12} />
                    <span>+{item.productionRate}/s</span>
                 </div>
                 <div className="bg-slate-900/50 p-2 rounded-lg text-xs flex justify-between items-center">
                    <span className="text-slate-400">Stock</span>
                    <span className={`font-bold ${currentStock > 0 ? 'text-white' : 'text-red-500'}`}>{currentStock}/{item.maxStock}</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-2">
                 <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onBuy(item, 1)}
                        disabled={!canAffordOne || !hasStockOne}
                        className={`py-2 rounded-lg font-bold text-xs transition-colors
                            ${canAffordOne && hasStockOne ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                    >
                        Buy 1
                    </button>
                    <button
                        onClick={() => onBuy(item, 5)}
                        disabled={!canAffordFive || !hasStockFive}
                        className={`py-2 rounded-lg font-bold text-xs transition-colors
                            ${canAffordFive && hasStockFive ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                    >
                        Buy 5
                    </button>
                 </div>

                 <button
                    onClick={() => onSelectItem(item)}
                    disabled={ownedCount === 0}
                    className={`
                        w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2
                        ${isSelected 
                            ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
                            : ownedCount > 0
                                ? 'bg-solar-600 text-white hover:bg-solar-500 shadow-lg shadow-solar-900/20' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }
                    `}
                 >
                    {isSelected ? 'Ready to Place' : ownedCount > 0 ? `Inventory (${ownedCount})` : 'Out of Stock'}
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};