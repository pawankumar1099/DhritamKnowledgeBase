'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/constants';
import { DhritamCategory } from '@/types/knowledgeBase';
import {
  Layers,
  Cpu,
  TrendingUp,
  Smartphone,
  Activity,
  ShieldCheck,
  Palette,
  Briefcase,
} from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: DhritamCategory;
  onSelectCategory: (category: DhritamCategory) => void;
  documentCounts: Record<string, number>;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  documentCounts,
}) => {
  const getCategoryIcon = (id: DhritamCategory) => {
    switch (id) {
      case 'all':
        return <Layers className="w-3.5 h-3.5" />;
      case 'hardware':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'strategy':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'product':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'clinical':
        return <Activity className="w-3.5 h-3.5" />;
      case 'regulatory':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'brand':
        return <Palette className="w-3.5 h-3.5" />;
      case 'operations':
        return <Briefcase className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = documentCounts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`btn-category-pill cursor-pointer ${isSelected ? 'active' : ''}`}
            >
              <span className={isSelected ? 'text-white' : 'text-[#4d4d4d]'}>
                {getCategoryIcon(cat.id)}
              </span>
              <span>{cat.name}</span>
              <span
                className={`pill-counter text-[11px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#fafafa] border border-[#ebebeb] text-[#8f8f8f]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
