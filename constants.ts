import { ShopItem, ItemTier } from './types';

export const GRID_SIZE = 8;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const TICK_RATE_MS = 1000; 
export const AUTO_SAVE_MS = 5000;
export const STOCK_REFRESH_MS = 5 * 60 * 1000; // 5 Minutes
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const CREDIT_CLAIM_COST = 100000;

export const EXCHANGE_UNLOCK_COST = 35000;
export const REBIRTH_BASE_COST = 1000000;
export const REBIRTH_MULTIPLIER_STEP = 0.5; // +50% per rebirth
export const MAX_LEVEL = 20;

// Level Calculation: Level = Math.floor(Math.sqrt(Money / 500)) + 1
// Max Level 20 requires approx 180,000 Money accumulated (roughly)
export const LEVEL_SCALING_FACTOR = 500; 

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'panel_basic',
    name: 'Basic Panel',
    description: 'Entry-level photovoltaic panel.',
    price: 100,
    productionRate: 1,
    tier: ItemTier.BASIC,
    color: 'bg-slate-600',
    iconName: 'Sun',
    maxStock: 100,
    requiredRebirth: 0
  },
  {
    id: 'panel_adv',
    name: 'Advanced Panel',
    description: 'High-efficiency mono-crystalline panel.',
    price: 600,
    productionRate: 8,
    tier: ItemTier.ADVANCED,
    color: 'bg-blue-600',
    iconName: 'Zap',
    maxStock: 50,
    requiredRebirth: 0
  },
  {
    id: 'panel_ind',
    name: 'Industrial Unit',
    description: 'Heavy industry panel for large scale production.',
    price: 3500,
    productionRate: 50,
    tier: ItemTier.INDUSTRIAL,
    color: 'bg-purple-600',
    iconName: 'Battery',
    maxStock: 25,
    requiredRebirth: 0
  },
  {
    id: 'panel_quantum',
    name: 'Quantum Cell',
    description: 'Experimental technology. Maximum energy density.',
    price: 25000,
    productionRate: 400,
    tier: ItemTier.FUTURISTIC,
    color: 'bg-rose-600',
    iconName: 'Cpu',
    maxStock: 10,
    requiredRebirth: 0
  },
  // Rebirth 1 Unlocks
  {
    id: 'plasma_conner',
    name: 'Plasma Conner',
    description: 'Super-heated plasma containment energy.',
    price: 75000,
    productionRate: 1200,
    tier: ItemTier.FUTURISTIC,
    color: 'bg-orange-600',
    iconName: 'Disc',
    maxStock: 8,
    requiredRebirth: 1
  },
  {
    id: 'reactor_fusion',
    name: 'Fusion Reactor',
    description: 'Harnesses the power of a star. Requires careful handling.',
    price: 150000,
    productionRate: 3000,
    tier: ItemTier.COSMIC,
    color: 'bg-cyan-500',
    iconName: 'Atom',
    maxStock: 5,
    requiredRebirth: 1
  },
  // Rebirth 2 Unlocks
  {
    id: 'orbital_mirror',
    name: 'Orbital Mirror',
    description: 'Reflects concentrated sunlight from orbit.',
    price: 500000,
    productionRate: 12000,
    tier: ItemTier.COSMIC,
    color: 'bg-indigo-500',
    iconName: 'Orbit',
    maxStock: 3,
    requiredRebirth: 2
  },
  {
    id: 'dyson_node',
    name: 'Dyson Node',
    description: 'Part of a megastructure to capture 100% of star output.',
    price: 2000000,
    productionRate: 45000,
    tier: ItemTier.COSMIC,
    color: 'bg-yellow-400',
    iconName: 'Globe',
    maxStock: 1,
    requiredRebirth: 2
  }
];

export const INITIAL_MONEY = 150;
export const REBIRTH_BONUS_MONEY = 10000; // Extra money per rebirth level