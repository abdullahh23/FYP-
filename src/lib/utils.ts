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

export function projectTags(project: Record<string, any>) {
  const tags = new Set<string>();
  if (project.material_quality) tags.add(String(project.material_quality).toLowerCase());
  if (project.interior_finish) tags.add(String(project.interior_finish).toLowerCase());
  if (project.exterior_finish) tags.add(String(project.exterior_finish).toLowerCase());
  if (project.construction_type) tags.add(String(project.construction_type).includes('Grey') ? 'cement' : 'finishing');
  if (project.solar) tags.add('solar');
  if (project.smart_home) tags.add('electrical');
  if (project.swimming_pool) tags.add('luxury');
  if (project.bedrooms) tags.add(`${project.bedrooms} Bedrooms`);
  if (project.bathrooms) tags.add(`${project.bathrooms} Bathrooms`);
  if (project.attached_baths) tags.add('Attached Baths');
  if (project.kitchens) tags.add(`${project.kitchens} Kitchen${project.kitchens > 1 ? 's' : ''}`);
  if (project.drawing_dining) tags.add('Drawing & Dining');
  if (project.tv_lounge) tags.add('TV Lounge');
  if (project.car_porch) tags.add(`Porch: ${project.car_porch}`);
  if (project.powder_room) tags.add('Powder Room');
  if (project.dirty_kitchen) tags.add('Dirty Kitchen');
  if (project.servant_quarter) tags.add('Servant Quarter');
  if (project.mumty_rooftop) tags.add('Mumty & Rooftop');
  return Array.from(tags);
}
