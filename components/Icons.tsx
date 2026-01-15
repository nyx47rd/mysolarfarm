import React from 'react';
import { Sun, Zap, Battery, Cpu, HelpCircle, LayoutDashboard, ShoppingCart, ArrowRightLeft, X, LayoutGrid, Trash2, Lock, Unlock, Atom, Globe, RotateCw, Package, Archive, ArrowDownToLine, Disc, Orbit, Calendar, ShieldCheck } from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 20 }) => {
  switch (name) {
    case 'Sun': return <Sun className={className} size={size} />;
    case 'Zap': return <Zap className={className} size={size} />;
    case 'Battery': return <Battery className={className} size={size} />;
    case 'Cpu': return <Cpu className={className} size={size} />;
    case 'Atom': return <Atom className={className} size={size} />;
    case 'Globe': return <Globe className={className} size={size} />;
    case 'Disc': return <Disc className={className} size={size} />;
    case 'Orbit': return <Orbit className={className} size={size} />;
    case 'LayoutDashboard': return <LayoutDashboard className={className} size={size} />;
    case 'LayoutGrid': return <LayoutGrid className={className} size={size} />;
    case 'ShoppingCart': return <ShoppingCart className={className} size={size} />;
    case 'ArrowRightLeft': return <ArrowRightLeft className={className} size={size} />;
    case 'X': return <X className={className} size={size} />;
    case 'Trash2': return <Trash2 className={className} size={size} />;
    case 'Lock': return <Lock className={className} size={size} />;
    case 'Unlock': return <Unlock className={className} size={size} />;
    case 'RotateCw': return <RotateCw className={className} size={size} />;
    case 'Package': return <Package className={className} size={size} />;
    case 'Archive': return <Archive className={className} size={size} />;
    case 'ArrowDownToLine': return <ArrowDownToLine className={className} size={size} />;
    case 'Calendar': return <Calendar className={className} size={size} />;
    case 'ShieldCheck': return <ShieldCheck className={className} size={size} />;
    default: return <HelpCircle className={className} size={size} />;
  }
};