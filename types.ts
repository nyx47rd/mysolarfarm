export enum ItemTier {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  INDUSTRIAL = 'INDUSTRIAL',
  FUTURISTIC = 'FUTURISTIC',
  COSMIC = 'COSMIC'
}

export type ViewType = 'FARM' | 'INVENTORY' | 'SHOP' | 'CREDITS' | 'REBIRTH';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  productionRate: number; // Base production
  tier: ItemTier;
  color: string;
  iconName: 'Sun' | 'Zap' | 'Battery' | 'Cpu' | 'Atom' | 'Globe' | 'Disc' | 'Orbit';
  maxStock: number; // Maximum stock available per cycle
  requiredRebirth: number; // New requirement
}

export interface GridCell {
  id: number; // 0-63
  itemId: string | null;
}

export interface GameState {
  money: number;
  xp: number; // Experience Points for leveling
  credits: number; 
  grid: GridCell[];
  inventory: Record<string, number>; // itemId -> count
  shopStock: Record<string, number>; // itemId -> remaining stock
  nextStockRefresh: number; // Timestamp
  lastSaveTime: number;
  totalProductionRate: number;
  rebirthLevel: number;
  multiplier: number;
  isExchangeUnlocked: boolean;
  lastCreditClaimTime: number; // Timestamp for weekly limit
  level: number; // 1-20
}