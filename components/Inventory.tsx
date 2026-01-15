import React from 'react';
import { ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { Icon } from './Icons';

interface InventoryProps {
  inventory: Record<string, number>;
  onSell: (item: ShopItem) => void;
  onEquip: (item: ShopItem) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ inventory, onSell, onEquip }) => {
  const inventoryItems = SHOP_ITEMS.filter(item => (inventory[item.id] || 0) > 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">My Inventory</h2>
        <p className="text-slate-400">Manage your systems. Equip them to the grid or sell them for cash.</p>
      </div>

      {inventoryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed text-slate-500">
            <Icon name="Package" size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Your inventory is empty.</p>
            <p className="text-sm">Visit the Shop to buy energy systems or unequip them from the Grid.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventoryItems.map((item) => {
            const count = inventory[item.id] || 0;
            const sellPrice = Math.floor(item.price * 0.5);

            return (
              <div key={item.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col relative overflow-hidden group">
                 {/* Decoration */}
                 <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${item.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>

                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${item.color} bg-opacity-20 text-white`}>
                            <Icon name={item.iconName} size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100">{item.name}</h3>
                            <span className="text-xs text-tech-500 font-mono">+{item.productionRate}/s</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                        <span className="text-xs text-slate-400 font-bold uppercase mr-1">Owned</span>
                        <span className="text-white font-mono font-bold">{count}</span>
                    </div>
                 </div>

                 <div className="mt-auto grid grid-cols-2 gap-2 relative z-10">
                    <button 
                        onClick={() => onEquip(item)}
                        className="flex items-center justify-center gap-2 bg-solar-600 hover:bg-solar-500 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        <Icon name="LayoutGrid" size={14} /> Equip
                    </button>
                    <button 
                        onClick={() => {
                            if(confirm(`Sell 1 ${item.name} for ${sellPrice}$?`)) {
                                onSell(item);
                            }
                        }}
                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-900/50 hover:text-red-200 text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-red-900/50"
                    >
                        <Icon name="Trash2" size={14} /> Sell ({sellPrice}$)
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
