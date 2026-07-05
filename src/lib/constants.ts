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
