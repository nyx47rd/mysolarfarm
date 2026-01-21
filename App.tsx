import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Grid } from './components/Grid';
import { Shop } from './components/Shop';
import { Navigation } from './components/Navigation';
import { CreditExchange } from './components/CreditExchange';
import { Rebirth } from './components/Rebirth';
import { Inventory } from './components/Inventory';
import { RebirthNotification } from './components/RebirthNotification';
import { AuthScreen } from './components/AuthScreen'; // Import new Auth Screen
import { GameState, ShopItem, ViewType } from './types';
import { TOTAL_CELLS, INITIAL_MONEY, SHOP_ITEMS, TICK_RATE_MS, AUTO_SAVE_MS, REBIRTH_BASE_COST, REBIRTH_MULTIPLIER_STEP, EXCHANGE_UNLOCK_COST, STOCK_REFRESH_MS, LEVEL_SCALING_FACTOR, MAX_LEVEL, CREDIT_CLAIM_COST, REBIRTH_BONUS_MONEY, ONE_WEEK_MS } from './constants';
import { RefreshCw, X, Archive, Cloud, CloudOff, LogOut } from 'lucide-react';

const STORAGE_KEY = 'solar_farm_save_v10'; 

// User interface for session state
interface User {
    id: string;
    username: string;
}

// Server Time Utility
const fetchServerTimeOffset = async (): Promise<number> => {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
            signal: controller.signal
        });
        clearTimeout(id);
        
        if (!response.ok) throw new Error("Time API failed");
        const data = await response.json();
        const serverTime = new Date(data.datetime).getTime();
        const localTime = Date.now();
        return serverTime - localTime; 
    } catch (e) {
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

// Default State Creator
const createNewGameState = (): GameState => {
    return {
        money: INITIAL_MONEY,
        xp: 0,
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
  const [user, setUser] = useState<User | null>(null); // Auth State
  const [gameState, setGameState] = useState<GameState>(createNewGameState);
  const [currentView, setCurrentView] = useState<ViewType>('FARM');
  const [selectedShopItem, setSelectedShopItem] = useState<ShopItem | null>(null);
  const [isStoreMode, setIsStoreMode] = useState(false);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [isTimeSynced, setIsTimeSynced] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  
  const [isResetting, setIsResetting] = useState(false);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Sync Time & Remove Loader
  useEffect(() => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 500);
      }

      fetchServerTimeOffset().then(offset => {
          if (offset !== 0) {
            setServerOffset(offset);
            setIsTimeSynced(true);
          }
      });
  }, []);

  const getServerTime = () => Date.now() + serverOffset;

  // Level & Production Loop
  useEffect(() => {
    // Only run loop if user is logged in
    if (!user) return;

    const baseRate = gameState.grid.reduce((acc, cell) => {
      if (!cell.itemId) return acc;
      const item = SHOP_ITEMS.find(i => i.id === cell.itemId);
      return acc + (item?.productionRate || 0);
    }, 0);
    
    const rawLevel = Math.floor(Math.sqrt(gameState.xp / LEVEL_SCALING_FACTOR)) + 1;
    const newLevel = Math.min(rawLevel, MAX_LEVEL);

    setGameState(prev => ({ 
        ...prev, 
        totalProductionRate: baseRate,
        level: newLevel
    }));
  }, [gameState.grid, gameState.xp, user]);

  // Tick Loop
  useEffect(() => {
    if (!user) return;

    const tick = setInterval(() => {
      if (isResetting) return;

      const now = getServerTime();
      setGameState(current => {
        let productionAmount = 0;
        if (current.level < MAX_LEVEL) {
            productionAmount = current.totalProductionRate * current.multiplier;
        }

        let newState = {
            ...current,
            money: current.money + productionAmount,
            xp: current.xp + productionAmount 
        };
        if (now > current.nextStockRefresh) {
            newState.shopStock = getInitialStocks();
            newState.nextStockRefresh = now + STOCK_REFRESH_MS;
        }
        return newState;
      });
    }, TICK_RATE_MS);

    return () => clearInterval(tick);
  }, [serverOffset, isResetting, user]); 

  // --- SAVE SYSTEM (CLOUD ONLY NOW) ---
  
  const saveToCloud = async (state: GameState) => {
      if (!user) return;
      try {
          setCloudStatus('saving');
          const res = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, gameState: state })
          });
          
          if (!res.ok) throw new Error("Cloud save failed");
          setCloudStatus('idle');
      } catch (e) {
          console.warn("Cloud save error:", e);
          setCloudStatus('error');
      }
  };

  useEffect(() => {
    if (!user) return;

    // Cloud Storage: Save every 5 seconds since we depend on it now
    const cloudSaveInterval = setInterval(() => {
        if (!isResetting) {
            saveToCloud(gameStateRef.current);
        }
    }, 5000);

    return () => {
        clearInterval(cloudSaveInterval);
    };
  }, [isResetting, user]);

  // --- Actions ---

  const handleBuy = (item: ShopItem, quantity: number) => {
    if (gameState.level >= MAX_LEVEL) {
        alert("MAX LEVEL REACHED! You cannot purchase items. You must Rebirth to continue.");
        return;
    }

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
      setCurrentView('FARM');
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
      setCurrentView('FARM'); 
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
              alert("Credit Claimed Successfully!");
          } else {
              alert("Weekly limit reached.");
          }
      }
  };

  const handleRebirth = () => {
      const nextRebirthCost = REBIRTH_BASE_COST * Math.pow(1.5, gameState.rebirthLevel);
      if (gameState.level < MAX_LEVEL) {
          alert(`You must reach Level ${MAX_LEVEL} first.`);
          return;
      }
      if (gameState.money >= nextRebirthCost) {
          const nextRebirthLevel = gameState.rebirthLevel + 1;
          const bonusMoney = nextRebirthLevel * REBIRTH_BONUS_MONEY;
          setGameState(prev => ({
              money: INITIAL_MONEY + bonusMoney,
              xp: 0, 
              credits: prev.credits,
              grid: Array.from({ length: TOTAL_CELLS }, (_, i) => ({ id: i, itemId: null })),
              inventory: {}, 
              shopStock: getInitialStocks(),
              nextStockRefresh: getServerTime() + STOCK_REFRESH_MS,
              lastSaveTime: getServerTime(),
              totalProductionRate: 0,
              rebirthLevel: nextRebirthLevel,
              multiplier: 1 + (nextRebirthLevel * REBIRTH_MULTIPLIER_STEP),
              isExchangeUnlocked: false,
              lastCreditClaimTime: prev.lastCreditClaimTime,
              level: 1
          }));
          alert("REBIRTH SUCCESSFUL!");
      }
  };

  const handleReset = () => {
    const userInput = window.prompt("FACTORY RESET: Type 'DELETE' to confirm permanent erasure:");
    
    if (userInput === 'DELETE') {
        setIsResetting(true); 
        // Reset DB as well if possible, or just local state and save empty
        setGameState(createNewGameState());
        // Trigger save immediately to overwrite DB
        setTimeout(() => {
            saveToCloud(createNewGameState()).then(() => window.location.reload());
        }, 100);
    }
  };

  const handleLogout = () => {
      saveToCloud(gameStateRef.current).then(() => {
          setUser(null);
          setGameState(createNewGameState());
      });
  };

  const handleLoginSuccess = (loggedInUser: User, savedData: any) => {
      setUser(loggedInUser);
      if (savedData) {
          // Merge with default to ensure no missing fields
          const defaultState = createNewGameState();
          setGameState({
              ...defaultState,
              ...savedData,
              // Ensure critical arrays/objects exist
              grid: savedData.grid || defaultState.grid,
              inventory: savedData.inventory || defaultState.inventory,
              shopStock: savedData.shopStock || defaultState.shopStock
          });
      } else {
          setGameState(createNewGameState());
      }
  };

  // --- RENDER ---

  if (isResetting) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
              <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="animate-spin text-red-500" size={48} />
                  <h2 className="text-xl font-bold">Wiping Data & Resetting...</h2>
              </div>
          </div>
      );
  }

  // FORCE LOGIN SCREEN
  if (!user) {
      return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

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
                        <div className="flex gap-2 items-center">
                            {/* Cloud Status Indicator */}
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50">
                                {cloudStatus === 'saving' && <RefreshCw size={12} className="text-blue-400 animate-spin" />}
                                {cloudStatus === 'idle' && <Cloud size={12} className="text-green-400" />}
                                {cloudStatus === 'error' && <CloudOff size={12} className="text-red-400" />}
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                    {cloudStatus === 'saving' ? 'Syncing...' : cloudStatus === 'error' ? 'Offline' : 'Synced'}
                                </span>
                            </div>

                            <button
                                onClick={() => setIsStoreMode(!isStoreMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold ${
                                    isStoreMode 
                                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                            >
                                <Archive size={14} /> {isStoreMode ? 'Done Storing' : 'Store Mode'}
                            </button>

                            {selectedShopItem && (
                                <button 
                                    onClick={() => setSelectedShopItem(null)}
                                    className="flex items-center gap-2 bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-xs font-bold"
                                >
                                    <X size={14} /> Cancel
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
                                Tap items to store them.
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-8 border-t border-slate-800 pt-4">
                        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-100 hover:text-white bg-red-900/50 hover:bg-red-800 rounded-lg transition-colors border border-red-900">
                            <RefreshCw size={14} /> HARD RESET
                        </button>
                    </div>
                  </div>
              );
          case 'INVENTORY':
              return <Inventory inventory={gameState.inventory} onSell={handleSell} onEquip={handleEquip} />;
          case 'SHOP':
              return <Shop money={gameState.money} inventory={gameState.inventory} shopStock={gameState.shopStock} onBuy={handleBuy} onSelectItem={handleShopSelect} selectedItem={selectedShopItem} nextRefreshTime={gameState.nextStockRefresh} rebirthLevel={gameState.rebirthLevel} />;
          case 'CREDITS':
              return <CreditExchange gameState={gameState} onClaimCredit={handleClaimCredit} onUnlock={handleExchangeUnlock} serverTime={getServerTime()} />;
          case 'REBIRTH':
              return <Rebirth gameState={gameState} onRebirth={handleRebirth} />;
          default:
              return null;
      }
  };

  const nextRebirthCost = REBIRTH_BASE_COST * Math.pow(1.5, gameState.rebirthLevel);
  const canRebirth = gameState.money >= nextRebirthCost && gameState.level >= MAX_LEVEL;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
        <Navigation currentView={currentView} onViewChange={(v) => { setCurrentView(v); setIsStoreMode(false); setSelectedShopItem(null); }} canRebirth={canRebirth} />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className="bg-slate-900 border-b border-slate-700 px-4 py-1 flex justify-between items-center text-xs text-slate-500">
                <span>Operator: <span className="text-solar-400 font-bold">{user.username}</span></span>
                <button onClick={handleLogout} className="flex items-center gap-1 hover:text-white transition-colors">
                    <LogOut size={12} /> Logout
                </button>
            </div>
            <Header gameState={gameState} isTimeSynced={isTimeSynced} />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 scroll-smooth">
                {renderContent()}
            </main>
            
            <RebirthNotification 
                level={gameState.level} 
                onGoToRebirth={() => setCurrentView('REBIRTH')} 
            />
        </div>
    </div>
  );
}

export default App;