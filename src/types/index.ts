export type UserRole = 'homeowner' | 'contractor' | 'supplier' | 'admin';
export type AccountStatus = 'active' | 'pending' | 'suspended';
export type ProjectStatus = 'Planning' | 'Contracted' | 'In Progress' | 'Completed';
export type QuotationStatus = 'requested' | 'submitted' | 'accepted' | 'rejected';
export type MessageKind = 'text' | 'image';

export type AiEstimate = {
  land_preparation_cost: number;
  structure_cost: number;
  electrical_cost: number;
  plumbing_cost: number;
  finishing_cost: number;
  total_estimate_min: number;
  total_estimate_max: number;
  explanation: string;
};

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  role: UserRole | null;
  city: string | null;
  is_verified: boolean;
  verification_date: string | null;
  verification_notes: string | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
};

export type ContractorProfile = {
  user_id: string;
  experience_years: number;
  specialization: string;
  bio: string | null;
  completed_projects: number;
  min_budget: number | null;
  max_budget: number | null;
  portfolio_urls: string[];
  average_rating: number;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  price: number;
  discount: number;
  image_urls: string[];
  stock: number;
  tags: string[];
  created_at: string;
};

export type Project = {
  id: string;
  homeowner_id: string;
  title: string;
  plot_size: number;
  covered_area: number;
  floors: number;
  basement: boolean;
  city: string;
  soil_type: string;
  construction_type: string;
  material_quality: string;
  interior_finish: string;
  exterior_finish: string;
  parking: boolean;
  solar: boolean;
  smart_home: boolean;
  garden: boolean;
  swimming_pool: boolean;
  tags: string[];
  status: ProjectStatus;
  ai_estimate_json: AiEstimate | null;
  ai_error: string | null;
  ai_estimated_at: string | null;
  accepted_quotation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContractorMatch = {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  profile_image_url: string | null;
  is_verified: boolean;
  experience_years: number;
  specialization: string;
  completed_projects: number;
  average_rating: number;
  min_budget: number | null;
  max_budget: number | null;
  portfolio_urls: string[];
  match_score: number;
};

export type Quotation = {
  id: string;
  project_id: string;
  homeowner_id: string;
  contractor_id: string;
  amount: number | null;
  duration_days: number | null;
  notes: string | null;
  status: QuotationStatus;
  timeline: string | null;
  created_at: string;
  updated_at: string;
  contractor?: Profile & { contractor_profiles?: ContractorProfile | ContractorProfile[] };
};

export type ChatMessage = {
  id: string;
  project_id: string;
  quotation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message_type: MessageKind;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

export type Promotion = {
  id: string;
  supplier_id: string;
  product_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  tags: string[];
  is_active: boolean;
  products?: SupplierProduct;
};
