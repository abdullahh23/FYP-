export type UserRole = 'homeowner' | 'contractor' | 'supplier' | 'admin';

// Legacy invoice module compatibility. These screens remain in the repository but are not part of BuildWise routing.
export type InvoiceTemplateId = 'blue-professional' | 'corporate-black-white' | 'freight-logistics' | 'executive-premium' | 'fleet-operations';
export interface Load { id: string; loadNumber: string; brokerName: string; pickupDate: string; grossAmount: number; originCity: string; originState: string; destinationCity: string; destinationState: string; }
export interface CompanySettings { companyName: string; companyAddress: string; companyPhone: string; companyEmail: string; paymentInstructions: string; zelle: string; payoneer: string; bankInformation: string; dispatchPercentage: number; invoiceTemplateId: InvoiceTemplateId; }
export interface CarrierSettings { carrierName: string; carrierAddress: string; mcNumber: string; carrierPhone: string; }
export type AccountStatus = 'active' | 'pending' | 'suspended';
export type ProjectStatus = 'Planning' | 'Contracted' | 'In Progress' | 'Completed';
export type QuotationStatus = 'pending' | 'negotiating' | 'accepted' | 'rejected';
export type MessageKind = 'text' | 'image' | 'file';
export type ProjectProgressStage = 'Planning' | 'Site Visit' | 'Foundation' | 'Grey Structure' | 'Roof' | 'Electrical' | 'Plaster' | 'Painting' | 'Finishing' | 'Completed';

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
  material_quality_preferences: string[];
};

export type SupplierProfile = {
  user_id: string;
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  years_in_business: number;
  city: string | null;
  address: string | null;
  contact_number: string | null;
  whatsapp: string | null;
  website: string | null;
  delivery_available: boolean;
  minimum_order: number;
  average_rating: number;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  price: number;
  discount: number;
  image_urls: string[];
  stock: number;
  unit: string;
  delivery_time: string | null;
  warranty: string | null;
  quality_grade: string;
  manufacturer: string | null;
  specifications: Record<string, string>;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  supplier_profile?: SupplierProfile;
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
  progress_stage: ProjectProgressStage;
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
  request_notes: string | null;
  created_at: string;
  updated_at: string;
  contractor?: Profile & { contractor_profiles?: ContractorProfile | ContractorProfile[] };
};

export type ProjectWithHomeowner = Project & {
  homeowner?: Profile | null;
  quotations?: Quotation[];
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
  conversation_id: string | null;
  file_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  seen_at: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  project_id: string;
  quotation_id: string | null;
  homeowner_id: string;
  contractor_id: string | null;
  supplier_id: string | null;
  last_message_at: string;
  created_at?: string;
};

export type ConversationThread = Conversation & {
  projects?: Project | null;
  homeowner?: Profile | null;
  contractor?: Profile | null;
  supplier?: Profile | null;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type RecommendedProduct = { product: SupplierProduct; supplier: SupplierProfile; match_score: number };

export type MaterialQuoteRequest = {
  id: string;
  project_id: string;
  homeowner_id: string;
  supplier_id: string;
  status: QuotationStatus;
  total_price: number | null;
  delivery_time: string | null;
  discount: number;
  notes: string | null;
  supplier?: SupplierProfile;
  items?: Array<{ product_id: string; quantity: number; quoted_unit_price: number | null; products?: SupplierProduct }>;
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
