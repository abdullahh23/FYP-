import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot run seed script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi'];

const CONTRACTORS = [
  { name: 'Mughal Construction Co.', email: 'contact@mughalconstruction.pk', phone: '03001234567', city: 'Lahore', specialization: 'Turnkey Construction & Grey Structure', experience: 15, rating: 4.8 },
  { name: 'Tariq Builders', email: 'info@tariqbuilders.com.pk', phone: '03219876543', city: 'Karachi', specialization: 'Modern Finishing & Interior', experience: 8, rating: 4.5 },
  { name: 'Zaman Estate & Builders', email: 'zaman.estate@gmail.com', phone: '03334567890', city: 'Islamabad', specialization: 'Smart Homes & Luxury Villas', experience: 12, rating: 4.9 },
  { name: 'Al-Madina Contractors', email: 'almadina@contractors.pk', phone: '03011122334', city: 'Faisalabad', specialization: 'Commercial & Residential Build', experience: 20, rating: 4.2 },
  { name: 'Bismillah Associates', email: 'bismillah.asso@outlook.com', phone: '03451234567', city: 'Rawalpindi', specialization: 'Cost-Effective Housing', experience: 5, rating: 4.4 },
];

const SUPPLIERS = [
  { name: 'Lahore Ceramics & Tiles', email: 'sales@lahoreceramics.pk', phone: '04231234567', city: 'Lahore', category: 'Tiles & Sanitary', biz_years: 10, rating: 4.7 },
  { name: 'Pak Steel Traders', email: 'info@paksteel.com', phone: '02198765432', city: 'Karachi', category: 'Steel & Cement', biz_years: 25, rating: 4.9 },
  { name: 'Master Paints Official', email: 'sales@masterpaints.pk', phone: '0512345678', city: 'Islamabad', category: 'Paint & Finishes', biz_years: 15, rating: 4.6 },
  { name: 'Itefaq Hardware & Electrical', email: 'itefaq.hw@gmail.com', phone: '03337654321', city: 'Faisalabad', category: 'Electrical & Plumbing', biz_years: 8, rating: 4.3 },
  { name: 'Ravi Sand & Bricks', email: 'ravi.sand@hotmail.com', phone: '03009988776', city: 'Lahore', category: 'Building Materials', biz_years: 30, rating: 4.5 },
];

// Helper to generate a random UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seedData() {
  console.log('Starting seed process...');

  try {
    for (const data of CONTRACTORS) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: 'Password123!',
        user_metadata: { name: data.name, role: 'contractor' }
      });
      
      if (authError) {
        console.log(`Skipping ${data.name} (probably exists): ${authError.message}`);
        continue;
      }
      
      const newUserId = authUser.user.id;
      
      await supabase.from('users').update({
        name: data.name,
        role: 'contractor',
        city: data.city,
        phone: data.phone,
        account_status: 'active'
      }).eq('id', newUserId);
      
      await supabase.from('contractor_profiles').insert({
        user_id: newUserId,
        experience_years: data.experience,
        specialization: data.specialization,
        completed_projects: Math.floor(Math.random() * 50) + 10,
        average_rating: data.rating,
        min_budget: 1000000,
        max_budget: 50000000,
        portfolio_urls: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80'
        ],
        material_quality_preferences: ['A+', 'A']
      });
      
      console.log(`Created Contractor: ${data.name}`);
    }

    for (const data of SUPPLIERS) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: 'Password123!',
        user_metadata: { name: data.name, role: 'supplier' }
      });
      
      if (authError) {
        console.log(`Skipping ${data.name} (probably exists): ${authError.message}`);
        continue;
      }
      
      const newUserId = authUser.user.id;
      
      await supabase.from('users').update({
        name: data.name,
        role: 'supplier',
        city: data.city,
        phone: data.phone,
        account_status: 'active'
      }).eq('id', newUserId);
      
      await supabase.from('supplier_profiles').insert({
        user_id: newUserId,
        company_name: data.name,
        description: `Premium supplier for ${data.category} based in ${data.city}. Providing top quality materials to builders across the region.`,
        years_in_business: data.biz_years,
        city: data.city,
        contact_number: data.phone,
        average_rating: data.rating,
        delivery_available: true,
        minimum_order: 50000
      });
      
      console.log(`Created Supplier: ${data.name}`);
      
      const products = [
        { name: 'Grade 60 Steel Rebar (Amreli)', category: 'Structure', price: 275000, discount: 5, unit: 'Ton', tags: ['Steel', 'Structure', 'Premium'] },
        { name: 'Maple Leaf Cement', category: 'Structure', price: 1250, discount: 2, unit: 'Bag', tags: ['Cement', 'Structure', 'A'] },
        { name: 'Master Paints Weathercoat', category: 'Paint', price: 8500, discount: 10, unit: 'Gallon', tags: ['Paint', 'Exterior', 'Finishing'] },
        { name: 'Master Tiles 24x24 (Glossy)', category: 'Finishing', price: 2200, discount: 0, unit: 'Sq M', tags: ['Tiles', 'Flooring', 'A+'] },
        { name: 'Fast Cables 7/0.29', category: 'Electrical', price: 6500, discount: 3, unit: 'Coil', tags: ['Electrical', 'Wiring', 'A'] },
        { name: 'Popular Pipes (PVC)', category: 'Plumbing', price: 450, discount: 5, unit: 'Length', tags: ['Plumbing', 'Pipes'] }
      ];
      
      for (const prod of products) {
        await supabase.from('supplier_products').insert({
          supplier_id: newUserId,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          discount: prod.discount,
          unit: prod.unit,
          tags: prod.tags,
          stock: 5000,
          quality_grade: 'A',
          is_active: true,
          image_urls: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80']
        });
      }
      
      console.log(`Created Products for ${data.name}`);
    }

    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seedData();
