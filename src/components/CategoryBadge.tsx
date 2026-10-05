import type { TopicConfig } from '../types';

interface CategoryBadgeProps {
  categoryName: string;
  config?: TopicConfig;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({
  categoryName,
  config,
  size = 'md',
}: CategoryBadgeProps) {
  const isSmall = size === 'sm';
  const IconComp = config?.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-bold uppercase tracking-wide ${
        isSmall ? 'text-[9px]' : 'text-[10px]'
      }`}
      style={{
        backgroundColor: config?.bg || 'rgba(163,163,172,0.1)',
        borderColor: config?.border || 'rgba(163,163,172,0.2)',
        color: config?.color || '#a1a1aa',
      }}
    >
      {IconComp && <IconComp size={isSmall ? 11 : 13} />}
      {categoryName}
    </span>
  );
}
