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
  auth: { autoRefreshToken: false, persistSession: false }
});

const CONTRACTORS = [
  { name: 'Mughal Construction Co.', email: 'contact@mughalconstruction.pk', phone: '03001234567', city: 'Lahore', specialization: 'Turnkey Construction & Grey Structure', experience: 15, rating: 4.8, projects: 87 },
  { name: 'Tariq Builders', email: 'info@tariqbuilders.com.pk', phone: '03219876543', city: 'Karachi', specialization: 'Modern Finishing & Interior', experience: 8, rating: 4.5, projects: 42 },
  { name: 'Zaman Estate & Builders', email: 'zaman.estate@gmail.com', phone: '03334567890', city: 'Islamabad', specialization: 'Smart Homes & Luxury Villas', experience: 12, rating: 4.9, projects: 63 },
  { name: 'Al-Madina Contractors', email: 'almadina@contractors.pk', phone: '03011122334', city: 'Faisalabad', specialization: 'Commercial & Residential Build', experience: 20, rating: 4.2, projects: 120 },
  { name: 'Bismillah Associates', email: 'bismillah.asso@outlook.com', phone: '03451234567', city: 'Rawalpindi', specialization: 'Cost-Effective Housing', experience: 5, rating: 4.4, projects: 28 },
];

const SUPPLIERS = [
  {
    name: 'Lahore Ceramics & Tiles', email: 'sales@lahoreceramics.pk', phone: '04231234567', city: 'Lahore', biz_years: 10, rating: 4.7,
    products: [
      { name: 'Master Tiles 24x24 (Glossy White)', brand: 'Master Tiles', category: 'Finishing', price: 2200, discount: 8, unit: 'Sq Ft', tags: ['tiles', 'flooring', 'finishing', 'interior'], quality_grade: 'A+', delivery_time: '3-5 business days' },
      { name: 'Master Tiles 12x24 (Matt Beige)', brand: 'Master Tiles', category: 'Finishing', price: 1800, discount: 5, unit: 'Sq Ft', tags: ['tiles', 'flooring', 'finishing'], quality_grade: 'A', delivery_time: '3-5 business days' },
      { name: 'Johal Marble (White Italian)', brand: 'Johal Marble', category: 'Finishing', price: 4500, discount: 0, unit: 'Sq Ft', tags: ['marble', 'luxury', 'flooring', 'premium', 'finishing'], quality_grade: 'A+', delivery_time: '7-10 business days' },
    ]
  },
  {
    name: 'Pak Steel Traders', email: 'info@paksteel.com', phone: '02198765432', city: 'Karachi', biz_years: 25, rating: 4.9,
    products: [
      { name: 'Grade 60 Steel Rebar (Amreli)', brand: 'Amreli Steels', category: 'Structure', price: 275000, discount: 5, unit: 'Ton', tags: ['steel', 'structure', 'rebar', 'construction'], quality_grade: 'A+', delivery_time: '2-4 business days' },
      { name: 'Maple Leaf Cement OPC 53', brand: 'Maple Leaf', category: 'Structure', price: 1250, discount: 2, unit: 'Bag', tags: ['cement', 'structure', 'construction', 'opc'], quality_grade: 'A', delivery_time: '1-2 business days' },
      { name: 'Bestway Cement (50 Kg)', brand: 'Bestway', category: 'Structure', price: 1150, discount: 3, unit: 'Bag', tags: ['cement', 'structure', 'construction'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
    ]
  },
  {
    name: 'Master Paints Official', email: 'sales@masterpaints.pk', phone: '0512345678', city: 'Islamabad', biz_years: 15, rating: 4.6,
    products: [
      { name: 'Master Paints Weathercoat (White)', brand: 'Master Paints', category: 'Paint', price: 8500, discount: 10, unit: 'Gallon', tags: ['paint', 'exterior', 'finishing', 'weathercoat'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'Master Emulsion (Interior Silk)', brand: 'Master Paints', category: 'Paint', price: 6200, discount: 8, unit: 'Gallon', tags: ['paint', 'interior', 'finishing', 'emulsion'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'ICI Dulux Weathershield', brand: 'ICI Dulux', category: 'Paint', price: 9800, discount: 5, unit: 'Gallon', tags: ['paint', 'exterior', 'finishing', 'premium'], quality_grade: 'A+', delivery_time: '2-4 business days' },
    ]
  },
  {
    name: 'Itefaq Hardware & Electrical', email: 'itefaq.hw@gmail.com', phone: '03337654321', city: 'Faisalabad', biz_years: 8, rating: 4.3,
    products: [
      { name: 'Fast Cables 7/0.29 (100m Coil)', brand: 'Fast Cables', category: 'Electrical', price: 6500, discount: 3, unit: 'Coil', tags: ['electrical', 'wiring', 'cables', 'construction'], quality_grade: 'A', delivery_time: '2-3 business days' },
      { name: 'Geepas LED Panel Light 18W', brand: 'Geepas', category: 'Electrical', price: 950, discount: 15, unit: 'Piece', tags: ['electrical', 'lighting', 'led', 'interior'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
      { name: 'Popular Pipes UPVC 4 inch', brand: 'Popular Pipes', category: 'Plumbing', price: 850, discount: 5, unit: 'Length (3m)', tags: ['plumbing', 'pipes', 'sanitary', 'construction'], quality_grade: 'A', delivery_time: '1-2 business days' },
    ]
  },
  {
    name: 'Ravi Sand & Bricks', email: 'ravi.sand@hotmail.com', phone: '03009988776', city: 'Lahore', biz_years: 30, rating: 4.5,
    products: [
      { name: 'Red Bricks (Khurpai Grade A)', brand: 'Ravi Kilns', category: 'Structure', price: 18000, discount: 0, unit: 'Per 1000 Bricks', tags: ['bricks', 'structure', 'construction', 'masonry'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'River Sand (Lawrencepur)', brand: 'Ravi Minerals', category: 'Structure', price: 4500, discount: 0, unit: 'Trolley', tags: ['sand', 'structure', 'construction', 'raw-material'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
      { name: 'Crush (Stone Aggregate 3/4")', brand: 'Ravi Minerals', category: 'Structure', price: 7200, discount: 2, unit: 'Trolley', tags: ['crush', 'aggregate', 'structure', 'construction'], quality_grade: 'A', delivery_time: '1-2 business days' },
    ]
  },
];

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
        console.log(`Skipping contractor ${data.name} (probably exists): ${authError.message}`);
        continue;
      }

      const newUserId = authUser.user.id;

      await supabase.from('users').update({
        name: data.name,
        role: 'contractor',
        city: data.city,
        phone: data.phone,
        account_status: 'active',
        is_verified: true,
      }).eq('id', newUserId);

      await supabase.from('contractor_profiles').insert({
        user_id: newUserId,
        experience_years: data.experience,
        specialization: data.specialization,
        completed_projects: data.projects,
        average_rating: data.rating,
        min_budget: 1500000,
        max_budget: 80000000,
        portfolio_urls: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        ],
        material_quality_preferences: ['A+', 'A', 'Premium'],
        bio: `${data.name} is one of the most trusted construction firms in ${data.city}, with over ${data.experience} years of field experience. We have successfully delivered ${data.projects}+ projects ranging from single-storey homes to commercial complexes. Our team specializes in ${data.specialization}, ensuring every project meets the highest standards of quality and client satisfaction.`
      });

      console.log(`Created Contractor: ${data.name}`);
    }

    // Seed today's date for promotions
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const data of SUPPLIERS) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: 'Password123!',
        user_metadata: { name: data.name, role: 'supplier' }
      });

      if (authError) {
        console.log(`Skipping supplier ${data.name} (probably exists): ${authError.message}`);
        continue;
      }

      const newUserId = authUser.user.id;

      await supabase.from('users').update({
        name: data.name,
        role: 'supplier',
        city: data.city,
        phone: data.phone,
        account_status: 'active',
        is_verified: true,
      }).eq('id', newUserId);

      await supabase.from('supplier_profiles').insert({
        user_id: newUserId,
        company_name: data.name,
        description: `${data.name} is a trusted supplier of premium construction materials in ${data.city} with ${data.biz_years} years of industry experience. We supply to builders, contractors, and homeowners across Pakistan.`,
        years_in_business: data.biz_years,
        city: data.city,
        contact_number: data.phone,
        whatsapp: data.phone,
        average_rating: data.rating,
        delivery_available: true,
        minimum_order: 25000,
        address: `Main Market, ${data.city}, Pakistan`
      });

      console.log(`Created Supplier: ${data.name}`);

      // Insert products into the correct 'products' table
      for (const prod of data.products) {
        const { data: insertedProduct, error: productError } = await supabase.from('products').insert({
          supplier_id: newUserId,
          name: prod.name,
          brand: prod.brand,
          category: prod.category,
          price: prod.price,
          discount: prod.discount,
          unit: prod.unit,
          tags: prod.tags,
          stock: 5000,
          quality_grade: prod.quality_grade,
          is_active: true,
          is_featured: Math.random() > 0.5,
          delivery_time: prod.delivery_time,
          image_urls: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80'],
          description: `High-quality ${prod.name} from ${prod.brand}. Best prices in ${data.city}.`
        }).select().single();

        if (productError) {
          console.log(`  Error inserting product ${prod.name}: ${productError.message}`);
          continue;
        }

        // Create a supplier promotion for each product so they show up in "Supplier Offers"
        await supabase.from('supplier_promotions').insert({
          supplier_id: newUserId,
          product_id: insertedProduct.id,
          title: `${prod.discount > 0 ? prod.discount + '% OFF: ' : 'Now Available: '}${prod.name}`,
          description: `Get ${prod.name} from ${data.name} at best market rates. Delivery available across Pakistan. ${prod.discount > 0 ? `Save ${prod.discount}% this season!` : 'Bulk discounts available.'}`,
          starts_at: today,
          ends_at: futureDate,
          tags: prod.tags,
          is_active: true
        });
      }

      console.log(`Created Products + Promotions for ${data.name}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('All contractors and suppliers are now verified and will appear in estimate results.');

  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seedData();
