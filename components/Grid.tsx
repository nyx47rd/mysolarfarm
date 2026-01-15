import React from 'react';
import { GridCell, ShopItem } from '../types';
import { SHOP_ITEMS, GRID_SIZE } from '../constants';
import { Icon } from './Icons';

interface GridProps {
  grid: GridCell[];
  onCellClick: (index: number) => void;
  onCellDrop: (sourceIndex: number, targetIndex: number) => void;
  selectedItem: ShopItem | null;
  inventoryCount: number;
  isStoreMode: boolean;
}

export const Grid: React.FC<GridProps> = ({ grid, onCellClick, onCellDrop, selectedItem, inventoryCount, isStoreMode }) => {
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isStoreMode || !grid[index].itemId) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr) {
        const sourceIndex = parseInt(sourceIndexStr, 10);
        if (sourceIndex !== targetIndex) {
            onCellDrop(sourceIndex, targetIndex);
        }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto aspect-square bg-slate-800/50 rounded-xl border border-slate-700 p-2 sm:p-4 shadow-2xl overflow-hidden relative">
      
      {/* Grid Overlay for Store Mode */}
      {isStoreMode && (
          <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse pointer-events-none flex items-center gap-1">
            <Icon name="Archive" size={12} /> STORE MODE
          </div>
      )}

      <div 
        className="grid gap-1 w-full h-full"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {grid.map((cell, index) => {
          const item = cell.itemId ? SHOP_ITEMS.find(i => i.id === cell.itemId) : null;
          const hasInventory = inventoryCount > 0;
          
          // Added aspect-square to force 1:1 ratio on the cell itself
          let cellClass = "aspect-square relative w-full h-full rounded-md flex items-center justify-center transition-all duration-200 ";
          
          if (item) {
            if (isStoreMode) {
                cellClass += "bg-blue-900/30 border-2 border-blue-500/50 cursor-pointer hover:bg-blue-500/20 ";
            } else {
                cellClass += `${item.color} shadow-lg border border-white/20 hover:brightness-110 active:scale-95 cursor-grab active:cursor-grabbing `;
            }
          } else {
             // Empty cell
             if (selectedItem && hasInventory && !isStoreMode) {
                cellClass += "bg-slate-700/50 border-2 border-dashed border-green-500/50 hover:bg-green-500/20 cursor-pointer hover:scale-105 ";
             } else {
                cellClass += "bg-slate-800/50 border border-slate-700/50 ";
                if (!isStoreMode) cellClass += "hover:bg-slate-700 ";
             }
          }

          return (
            <button
              key={cell.id}
              onClick={() => onCellClick(index)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              draggable={!!item && !isStoreMode}
              className={cellClass}
              disabled={(!item && !selectedItem) || (selectedItem && !hasInventory && !item) || (isStoreMode && !item)}
            >
              {item && (
                 <>
                    <Icon name={item.iconName} className={`text-white drop-shadow-md w-3/5 h-3/5 ${isStoreMode ? 'opacity-70 scale-90' : ''}`} />
                    {isStoreMode && <Icon name="ArrowDownToLine" className="absolute text-blue-300 w-1/2 h-1/2 animate-bounce" />}
                 </>
              )}
              {!item && selectedItem && hasInventory && !isStoreMode && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
                    <Icon name={selectedItem.iconName} className="text-green-400 w-1/2 h-1/2 opacity-50" />
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};