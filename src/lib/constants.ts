export const currency = {
  code: 'PKR',
  label: 'Pakistani Rupees'
};

export const roles = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor / Builder' },
  { value: 'supplier', label: 'Material Supplier' }
] as const;

export const cityOptions = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other'];
export const soilOptions = ['Clay', 'Sandy', 'Rocky', 'Mixed'];
export const constructionOptions = ['Grey Structure', 'Turnkey'];
export const materialQualityOptions = ['Economy', 'Standard', 'Premium', 'Luxury'];
export const interiorFinishOptions = ['Basic', 'Standard', 'Premium'];
export const exteriorFinishOptions = ['Basic', 'Premium'];

export const productTags = [
  'luxury',
  'premium',
  'economy',
  'electrical',
  'plumbing',
  'finishing',
  'solar',
  'doors',
  'windows',
  'paint',
  'steel',
  'cement',
  'bricks'
];

export const projectStatuses = ['Planning', 'Contracted', 'In Progress', 'Completed'] as const;
export const projectProgressStages = ['Planning', 'Site Visit', 'Foundation', 'Grey Structure', 'Roof', 'Electrical', 'Plaster', 'Painting', 'Finishing', 'Completed'] as const;

export const productCategories = [
  'Cement', 'Steel', 'Bricks', 'Sand', 'Crush', 'Tiles', 'Marble', 'Granite', 'Paint', 'Doors', 'Windows',
  'Kitchen', 'Bathroom', 'Electrical', 'Lighting', 'Fans', 'AC', 'Solar', 'Plumbing', 'Wood', 'Roofing',
  'False Ceiling', 'Glass', 'Security', 'Smart Home', 'Hardware'
] as const;

export const productUnits = ['piece', 'bag', 'ton', 'kg', 'sq ft', 'meter', 'liter', 'set'] as const;
