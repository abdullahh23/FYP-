import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

export function initials(name?: string | null) {
  return (name ?? 'BuildWise User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function projectTags(project: {
  material_quality: string;
  interior_finish: string;
  exterior_finish: string;
  construction_type: string;
  solar: boolean;
  smart_home: boolean;
  swimming_pool: boolean;
}) {
  const tags = new Set<string>();
  tags.add(project.material_quality.toLowerCase());
  tags.add(project.interior_finish.toLowerCase());
  tags.add(project.exterior_finish.toLowerCase());
  tags.add(project.construction_type.includes('Grey') ? 'cement' : 'finishing');
  if (project.solar) tags.add('solar');
  if (project.smart_home) tags.add('electrical');
  if (project.swimming_pool) tags.add('luxury');
  return Array.from(tags);
}
