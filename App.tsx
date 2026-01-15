import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Grid } from './components/Grid';
import { Shop } from './components/Shop';
import { Navigation } from './components/Navigation';
import { CreditExchange } from './components/CreditExchange';
import { Rebirth } from './components/Rebirth';
import { Inventory } from './components/Inventory';
import { GameState, ShopItem, ViewType } from './types';
import { TOTAL_CELLS, INITIAL_MONEY, SHOP_ITEMS, TICK_RATE_MS, AUTO_SAVE_MS, REBIRTH_BASE_COST, REBIRTH_MULTIPLIER_STEP, EXCHANGE_UNLOCK_COST, STOCK_REFRESH_MS, LEVEL_SCALING_FACTOR, MAX_LEVEL, CREDIT_CLAIM_COST, REBIRTH_BONUS_MONEY, ONE_WEEK_MS } from './constants';
import { RefreshCw, X, Archive } from 'lucide-react';

const STORAGE_KEY = 'solar_farm_save_v6';

// Server Time Utility
const fetchServerTimeOffset = async (): Promise<number> => {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        if (!response.ok) throw new Error("Time API failed");
        const data = await response.json();
        const serverTime = new Date(data.datetime).getTime();
        const localTime = Date.now();
        return serverTime - localTime; // Offset to add to local time
    } catch (e) {
        console.warn("Could not sync time, defaulting to local.", e);
        return 0;
    }
};

const getInitialStocks = () => {
    const stocks: Record<string, number> = {};
    SHOP_ITEMS.forEach(item => {
        stocks[item.id] = item.maxStock;
    });
    return stocks;
};

const getInitialState = (): GameState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        inventory: parsed.inventory || {},
        shopStock: parsed.shopStock || getInitialStocks(),
        nextStockRefresh: parsed.nextStockRefresh || Date.now() + STOCK_REFRESH_MS,
        rebirthLevel: parsed.rebirthLevel || 0,
        multiplier: parsed.multiplier || 1,
        isExchangeUnlocked: parsed.isExchangeUnlocked || false,
        lastCreditClaimTime: parsed.lastCreditClaimTime || 0,
        level: parsed.level || 1
      };
    } catch (e) {
      console.error("Save file corrupted, resetting.");
    }
  }
  return {
    money: INITIAL_MONEY,
    credits: 0,
    grid: Array.from({ length: TOTAL_CELLS }, (_, i) => ({ id: i, itemId: null })),
    inventory: {},
    shopStock: getInitialStocks(),
    nextStockRefresh: Date.now() + STOCK_REFRESH_MS,
    lastSaveTime: Date.now(),
    totalProductionRate: 0,
    rebirthLevel: 0,
    multiplier: 1,
    isExchangeUnlocked: false,
    lastCreditClaimTime: 0,
    level: 1
  };
};

function App() {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const [currentView, setCurrentView] = useState<ViewType>('FARM');
  const [selectedShopItem, setSelectedShopItem] = useState<ShopItem | null>(null);
  const [isStoreMode, setIsStoreMode] = useState(false);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [isTimeSynced, setIsTimeSynced] = useState(false);
  
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Sync Time on Mount
  useEffect(() => {
      fetchServerTimeOffset().then(offset => {
          setServerOffset(offset);
          setIsTimeSynced(offset !== 0);
      });
  }, []);

  const getServerTime = () => Date.now() + serverOffset;

  // Level Calculation & Production Loop
  useEffect(() => {
    const baseRate = gameState.grid.reduce((acc, cell) => {
      if (!cell.itemId) return acc;
      const item = SHOP_ITEMS.find(i => i.id === cell.itemId);
      return acc + (item?.productionRate || 0);
    }, 0);
    
    // Calculate Level
    // Formula derived from constant: Level = sqrt(Money / Factor) + 1
    // Capped at MAX_LEVEL
    const rawLevel = Math.floor(Math.sqrt(gameState.money / LEVEL_SCALING_FACTOR)) + 1;
    const newLevel = Math.min(rawLevel, MAX_LEVEL);

    setGameState(prev => ({ 
        ...prev, 
        totalProductionRate: baseRate,
        level: newLevel
    }));
  }, [gameState.grid, gameState.money]);

  // Tick Loop
  useEffect(() => {
    const tick = setInterval(() => {
      const now = getServerTime();
      
      setGameState(current => {
        let newState = {
            ...current,
            money: current.money + (current.totalProductionRate * current.multiplier)
        };

        // Stock Refresh Logic
        if (now > current.nextStockRefresh) {
            newState.shopStock = getInitialStocks();
            newState.nextStockRefresh = now + STOCK_REFRESH_MS;
        }

        return newState;
      });
    }, TICK_RATE_MS);

    return () => clearInterval(tick);
  }, [serverOffset]); // Re-bind if offset changes (rare)

  // Auto Save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameStateRef.current));
    }, AUTO_SAVE_MS);
    return () => clearInterval(saveInterval);
  }, []);

  // --- View Handling ---
  const handleViewChange = (view: ViewType) => {
      setCurrentView(view);
      setIsStoreMode(false);
      if (view !== 'FARM') setSelectedShopItem(null);
  };

  // --- Actions ---

  const handleBuy = (item: ShopItem, quantity: number) => {
    const currentStock = gameState.shopStock[item.id] ?? 0;
    if (currentStock < quantity) {
        alert("Not enough stock!");
        return;
    }
    const cost = item.price * quantity;
    if (gameState.money >= cost) {
        setGameState(prev => ({
            ...prev,
            money: prev.money - cost,
            inventory: {
                ...prev.inventory,
                [item.id]: (prev.inventory[item.id] || 0) + quantity
            },
            shopStock: {
                ...prev.shopStock,
                [item.id]: currentStock - quantity
            }
        }));
    }
  };

  const handleSell = (item: ShopItem) => {
      const owned = gameState.inventory[item.id] || 0;
      if (owned > 0) {
          const refund = Math.floor(item.price * 0.5);
          setGameState(prev => ({
              ...prev,
              money: prev.money + refund,
              inventory: {
                  ...prev.inventory,
                  [item.id]: owned - 1
              }
          }));
      }
  };

  const handleEquip = (item: ShopItem) => {
      setSelectedShopItem(item);
      handleViewChange('FARM');
  };

  const handleCellClick = (index: number) => {
    if (isStoreMode) {
        const cell = gameState.grid[index];
        if (cell.itemId) {
            setGameState(prev => {
                const newGrid = [...prev.grid];
                newGrid[index] = { ...newGrid[index], itemId: null };
                return { 
                    ...prev, 
                    grid: newGrid,
                    inventory: {
                        ...prev.inventory,
                        [cell.itemId!]: (prev.inventory[cell.itemId!] || 0) + 1
                    }
                };
            });
        }
        return;
    }

    if (!selectedShopItem) return;
    if (gameState.grid[index].itemId !== null) return;

    const inventoryCount = gameState.inventory[selectedShopItem.id] || 0;
    if (inventoryCount > 0) {
      setGameState(prev => {
        const newGrid = [...prev.grid];
        newGrid[index] = { ...newGrid[index], itemId: selectedShopItem.id };
        const newInventoryCount = (prev.inventory[selectedShopItem.id] || 1) - 1;
        if (newInventoryCount === 0) setSelectedShopItem(null);
        return {
          ...prev,
          grid: newGrid,
          inventory: {
              ...prev.inventory,
              [selectedShopItem.id]: newInventoryCount
          }
        };
      });
    }
  };

  const handleGridDrop = (sourceIndex: number, targetIndex: number) => {
      setGameState(prev => {
          const newGrid = [...prev.grid];
          const sourceItem = newGrid[sourceIndex].itemId;
          const targetItem = newGrid[targetIndex].itemId;
          newGrid[sourceIndex].itemId = targetItem;
          newGrid[targetIndex].itemId = sourceItem;
          return { ...prev, grid: newGrid };
      });
  };

  const handleShopSelect = (item: ShopItem) => {
      setSelectedShopItem(item);
      handleViewChange('FARM'); 
  };

  const handleDeselect = () => setSelectedShopItem(null);

  const toggleStoreMode = () => {
      const newMode = !isStoreMode;
      setIsStoreMode(newMode);
      if (newMode) setSelectedShopItem(null);
  };

  const handleExchangeUnlock = () => {
      if (gameState.money >= EXCHANGE_UNLOCK_COST) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - EXCHANGE_UNLOCK_COST,
              isExchangeUnlocked: true
          }));
      }
  };

  // Weekly Credit Claim Logic
  const handleClaimCredit = () => {
      const now = getServerTime();
      if (gameState.money >= CREDIT_CLAIM_COST) {
          const timeSinceLast = now - (gameState.lastCreditClaimTime || 0);
          if (timeSinceLast >= ONE_WEEK_MS) {
              setGameState(prev => ({
                  ...prev,
                  money: prev.money - CREDIT_CLAIM_COST,
                  credits: prev.credits + 1,
                  lastCreditClaimTime: now
              }));
              alert("Credit Claimed Successfully! Come back next week.");
          } else {
              alert("Weekly limit reached.");
          }
      }
  };

  const handleRebirth = () => {
      const nextRebirthCost = REBIRTH_BASE_COST * Math.pow(1.5, gameState.rebirthLevel);
      
      // Must be Level 20 AND have enough money
      if (gameState.level < MAX_LEVEL) {
          alert(`You must reach Level ${MAX_LEVEL} first.`);
          return;
      }

      if (gameState.money >= nextRebirthCost) {
          const nextRebirthLevel = gameState.rebirthLevel + 1;
          const bonusMoney = nextRebirthLevel * REBIRTH_BONUS_MONEY;

          setGameState(prev => ({
              money: INITIAL_MONEY + bonusMoney,
              credits: prev.credits, // Keep credits
              grid: Array.from({ length: TOTAL_CELLS }, (_, i) => ({ id: i, itemId: null })),
              inventory: {}, 
              shopStock: getInitialStocks(),
              nextStockRefresh: getServerTime() + STOCK_REFRESH_MS,
              lastSaveTime: getServerTime(),
              totalProductionRate: 0,
              rebirthLevel: nextRebirthLevel,
              multiplier: 1 + (nextRebirthLevel * REBIRTH_MULTIPLIER_STEP),
              isExchangeUnlocked: false, // Relock exchange? Usually yes for prestige.
              lastCreditClaimTime: prev.lastCreditClaimTime, // Preserve cooldown
              level: 1 // Reset level
          }));
          alert(`REBIRTH SUCCESSFUL! +${bonusMoney}$ Bonus Cash & New Items Unlocked!`);
      }
  };

  const handleReset = () => {
    // Requires typing 'DELETE' to confirm
    const userInput = window.prompt("FACTORY RESET WARNING:\nThis will permanently delete your farm, inventory, and credits.\n\nTo confirm, type 'DELETE' in all caps below:");
    
    if (userInput === 'DELETE') {
        // 1. Create a clean state object explicitly
        const cleanState: GameState = {
            money: INITIAL_MONEY,
            credits: 0,
            grid: Array.from({ length: TOTAL_CELLS }, (_, i) => ({ id: i, itemId: null })),
            inventory: {},
            shopStock: getInitialStocks(),
            nextStockRefresh: Date.now() + STOCK_REFRESH_MS,
            lastSaveTime: Date.now(),
            totalProductionRate: 0,
            rebirthLevel: 0,
            multiplier: 1,
            isExchangeUnlocked: false,
            lastCreditClaimTime: 0,
            level: 1
        };

        // 2. FORCE SAVE the clean state to storage immediately.
        // We do this instead of removeItem to prevent any pending auto-save interval
        // from writing old state back to storage before the reload happens.
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
        } catch (e) {
            console.error("Reset failed", e);
        }
        
        // 3. Update React state immediately (visual feedback)
        setGameState(cleanState);
        
        // 4. Force Reload
        window.location.reload();
    } else if (userInput !== null) {
        alert("Reset cancelled. Text did not match 'DELETE'.");
    }
  };

  const renderContent = () => {
      switch (currentView) {
          case 'FARM':
              return (
                  <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-2">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Solar Grid</h2>
                            <p className="text-slate-400 text-sm">Drag to move. Tap to place.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleStoreMode}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                                    isStoreMode 
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                <Archive size={14} /> {isStoreMode ? 'Done Storing' : 'Store Mode'}
                            </button>

                            {selectedShopItem && (
                                <button 
                                    onClick={handleDeselect}
                                    className="flex items-center gap-2 bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-xs font-bold"
                                >
                                    <X size={14} /> Cancel Place
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <Grid 
                            grid={gameState.grid} 
                            onCellClick={handleCellClick}
                            onCellDrop={handleGridDrop}
                            selectedItem={selectedShopItem}
                            inventoryCount={selectedShopItem ? (gameState.inventory[selectedShopItem.id] || 0) : 0}
                            isStoreMode={isStoreMode}
                        />
                        {selectedShopItem && !isStoreMode && (
                             <div className="mt-4 text-center bg-solar-500/10 border border-solar-500/30 p-2 rounded-lg text-solar-400 text-sm font-medium animate-pulse">
                                Placing: {selectedShopItem.name} | Available: {gameState.inventory[selectedShopItem.id] || 0}
                             </div>
                        )}
                        {isStoreMode && (
                            <div className="mt-4 text-center bg-blue-500/10 border border-blue-500/30 p-2 rounded-lg text-blue-400 text-sm font-medium">
                                Tap any system on the grid to move it back to your Inventory.
                            </div>
                        )}
                        {!isStoreMode && !selectedShopItem && (
                            <div className="mt-4 text-center text-slate-600 text-xs font-medium">
                                Tip: You can drag and drop systems to rearrange them.
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-8 border-t border-slate-800 pt-4">
                        <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-900 hover:text-red-400 bg-red-900/10 hover:bg-red-900/30 rounded-lg transition-colors">
                            <RefreshCw size={14} /> Hard Reset
                        </button>
                    </div>
                  </div>
              );
          case 'INVENTORY':
              return (
                  <Inventory 
                    inventory={gameState.inventory}
                    onSell={handleSell}
                    onEquip={handleEquip}
                  />
              );
          case 'SHOP':
              return (
                  <Shop 
                      money={gameState.money} 
                      inventory={gameState.inventory}
                      shopStock={gameState.shopStock}
                      onBuy={handleBuy}
                      onSelectItem={handleShopSelect}
                      selectedItem={selectedShopItem}
                      nextRefreshTime={gameState.nextStockRefresh}
                      rebirthLevel={gameState.rebirthLevel}
                  />
              );
          case 'CREDITS':
              return (
                  <CreditExchange 
                      gameState={gameState}
                      onClaimCredit={handleClaimCredit}
                      onUnlock={handleExchangeUnlock}
                      serverTime={getServerTime()}
                  />
              );
          case 'REBIRTH':
              return (
                  <Rebirth 
                    gameState={gameState}
                    onRebirth={handleRebirth}
                  />
              );
          default:
              return null;
      }
  };

  const nextRebirthCost = REBIRTH_BASE_COST * Math.pow(1.5, gameState.rebirthLevel);
  const canRebirth = gameState.money >= nextRebirthCost && gameState.level >= MAX_LEVEL;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <Navigation currentView={currentView} onViewChange={handleViewChange} canRebirth={canRebirth} />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Header gameState={gameState} isTimeSynced={isTimeSynced} />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 scroll-smooth">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}

export default App;