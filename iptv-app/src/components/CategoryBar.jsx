import { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

const colorMap = {
  indigo: { active: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25', dot: 'bg-indigo-400' },
  purple: { active: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25', dot: 'bg-purple-400' },
  pink: { active: 'bg-pink-500 text-white shadow-lg shadow-pink-500/25', dot: 'bg-pink-400' },
};

const CategoryBar = ({ categories, activeCategory, onSelect, loading = false, color = 'indigo', label = 'Categorias' }) => {
  const scrollRef = useRef(null);
  const colors = colorMap[color] || colorMap.indigo;

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 250, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-3 w-20 rounded animate-shimmer" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-lg animate-shimmer shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center gap-2 px-1">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-gray-700">({categories.length})</span>
      </div>

      {/* Categories container */}
      <div className="relative group/cat">
        {categories.length > 5 && (
          <>
            <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0a0f1e] border border-white/10 flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity hover:bg-white/10">
              <ChevronLeftIcon className="w-3.5 h-3.5 text-white" />
            </button>
            <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0a0f1e] border border-white/10 flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity hover:bg-white/10">
              <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
            </button>
          </>
        )}

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-0.5">
          {/* "Todos" button */}
          <button
            onClick={() => onSelect(null)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
              activeCategory === null
                ? `${colors.active} border-transparent`
                : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
            }`}
          >
            Todos
          </button>

          {/* Category buttons */}
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => onSelect(cat.category_id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                activeCategory === cat.category_id
                  ? `${colors.active} border-transparent`
                  : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
