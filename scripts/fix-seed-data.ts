import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SUPPLIERS = [
  {
    email: 'sales@lahoreceramics.pk',
    city: 'Lahore',
    phone: '04231234567',
    biz_years: 10,
    rating: 4.7,
    products: [
      { name: 'Master Tiles 24x24 (Glossy White)', brand: 'Master Tiles', category: 'Finishing', price: 2200, discount: 8, unit: 'Sq Ft', tags: ['tiles', 'flooring', 'finishing', 'interior', 'Finishing'], quality_grade: 'A+', delivery_time: '3-5 business days' },
      { name: 'Master Tiles 12x24 (Matt Beige)', brand: 'Master Tiles', category: 'Finishing', price: 1800, discount: 5, unit: 'Sq Ft', tags: ['tiles', 'flooring', 'finishing', 'Finishing'], quality_grade: 'A', delivery_time: '3-5 business days' },
      { name: 'Johal Marble (White Italian)', brand: 'Johal Marble', category: 'Finishing', price: 4500, discount: 0, unit: 'Sq Ft', tags: ['marble', 'luxury', 'flooring', 'premium', 'finishing', 'Finishing'], quality_grade: 'A+', delivery_time: '7-10 business days' },
    ]
  },
  {
    email: 'info@paksteel.com',
    city: 'Karachi',
    phone: '02198765432',
    biz_years: 25,
    rating: 4.9,
    products: [
      { name: 'Grade 60 Steel Rebar (Amreli)', brand: 'Amreli Steels', category: 'Structure', price: 275000, discount: 5, unit: 'Ton', tags: ['steel', 'structure', 'rebar', 'construction', 'Structure'], quality_grade: 'A+', delivery_time: '2-4 business days' },
      { name: 'Maple Leaf Cement OPC 53', brand: 'Maple Leaf', category: 'Structure', price: 1250, discount: 2, unit: 'Bag', tags: ['cement', 'structure', 'construction', 'opc', 'Structure'], quality_grade: 'A', delivery_time: '1-2 business days' },
      { name: 'Bestway Cement (50 Kg)', brand: 'Bestway', category: 'Structure', price: 1150, discount: 3, unit: 'Bag', tags: ['cement', 'structure', 'construction', 'Structure'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
    ]
  },
  {
    email: 'sales@masterpaints.pk',
    city: 'Islamabad',
    phone: '0512345678',
    biz_years: 15,
    rating: 4.6,
    products: [
      { name: 'Master Paints Weathercoat (White)', brand: 'Master Paints', category: 'Paint', price: 8500, discount: 10, unit: 'Gallon', tags: ['paint', 'exterior', 'finishing', 'weathercoat', 'Paint', 'Finishing'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'Master Emulsion (Interior Silk)', brand: 'Master Paints', category: 'Paint', price: 6200, discount: 8, unit: 'Gallon', tags: ['paint', 'interior', 'finishing', 'emulsion', 'Paint', 'Finishing'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'ICI Dulux Weathershield', brand: 'ICI Dulux', category: 'Paint', price: 9800, discount: 5, unit: 'Gallon', tags: ['paint', 'exterior', 'finishing', 'premium', 'Paint'], quality_grade: 'A+', delivery_time: '2-4 business days' },
    ]
  },
  {
    email: 'itefaq.hw@gmail.com',
    city: 'Faisalabad',
    phone: '03337654321',
    biz_years: 8,
    rating: 4.3,
    products: [
      { name: 'Fast Cables 7/0.29 (100m Coil)', brand: 'Fast Cables', category: 'Electrical', price: 6500, discount: 3, unit: 'Coil', tags: ['electrical', 'wiring', 'cables', 'construction', 'Electrical'], quality_grade: 'A', delivery_time: '2-3 business days' },
      { name: 'Geepas LED Panel Light 18W', brand: 'Geepas', category: 'Electrical', price: 950, discount: 15, unit: 'Piece', tags: ['electrical', 'lighting', 'led', 'interior', 'Electrical'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
      { name: 'Popular Pipes UPVC 4 inch', brand: 'Popular Pipes', category: 'Plumbing', price: 850, discount: 5, unit: 'Length (3m)', tags: ['plumbing', 'pipes', 'sanitary', 'construction', 'Plumbing'], quality_grade: 'A', delivery_time: '1-2 business days' },
    ]
  },
  {
    email: 'ravi.sand@hotmail.com',
    city: 'Lahore',
    phone: '03009988776',
    biz_years: 30,
    rating: 4.5,
    products: [
      { name: 'Red Bricks (Khurpai Grade A)', brand: 'Ravi Kilns', category: 'Structure', price: 18000, discount: 0, unit: 'Per 1000 Bricks', tags: ['bricks', 'structure', 'construction', 'masonry', 'Structure'], quality_grade: 'A', delivery_time: '1-3 business days' },
      { name: 'River Sand (Lawrencepur)', brand: 'Ravi Minerals', category: 'Structure', price: 4500, discount: 0, unit: 'Trolley', tags: ['sand', 'structure', 'construction', 'raw-material', 'Structure'], quality_grade: 'Standard', delivery_time: '1-2 business days' },
      { name: 'Crush (Stone Aggregate 3/4")', brand: 'Ravi Minerals', category: 'Structure', price: 7200, discount: 2, unit: 'Trolley', tags: ['crush', 'aggregate', 'structure', 'construction', 'Structure'], quality_grade: 'A', delivery_time: '1-2 business days' },
    ]
  },
];

const CONTRACTOR_EMAILS = [
  'contact@mughalconstruction.pk',
  'info@tariqbuilders.com.pk',
  'zaman.estate@gmail.com',
  'almadina@contractors.pk',
  'bismillah.asso@outlook.com',
];

const today = new Date().toISOString().split('T')[0];
const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

async function fixData() {
  console.log('🔧 Fixing existing seeded data...\n');

  // 1. Fix contractors: set is_verified=true
  console.log('--- Fixing Contractors ---');
  for (const email of CONTRACTOR_EMAILS) {
    const { data: user } = await supabase.from('users').select('id, name, is_verified').eq('email', email).single();
    if (!user) { console.log(`  ⚠️  Not found: ${email}`); continue; }

    await supabase.from('users').update({ is_verified: true, account_status: 'active' }).eq('id', user.id);
    console.log(`  ✅ Verified contractor: ${user.name}`);
  }

  // 2. Fix suppliers: set is_verified=true, insert products + promotions
  console.log('\n--- Fixing Suppliers + Inserting Products & Promotions ---');
  for (const supplier of SUPPLIERS) {
    const { data: user } = await supabase.from('users').select('id, name').eq('email', supplier.email).single();
    if (!user) { console.log(`  ⚠️  Not found: ${supplier.email}`); continue; }

    // Set verified
    await supabase.from('users').update({ is_verified: true, account_status: 'active' }).eq('id', user.id);

    // Update supplier profile
    await supabase.from('supplier_profiles').upsert({
      user_id: user.id,
      company_name: user.name,
      description: `${user.name} is a trusted supplier of premium construction materials in ${supplier.city} with ${supplier.biz_years} years of industry experience.`,
      years_in_business: supplier.biz_years,
      city: supplier.city,
      contact_number: supplier.phone,
      whatsapp: supplier.phone,
      average_rating: supplier.rating,
      delivery_available: true,
      minimum_order: 25000,
      address: `Main Market, ${supplier.city}, Pakistan`
    }, { onConflict: 'user_id' });

    console.log(`  ✅ Verified supplier: ${user.name}`);

    // Delete old products to avoid duplicates
    await supabase.from('products').delete().eq('supplier_id', user.id);

    // Insert products
    for (const prod of supplier.products) {
      const { data: insertedProduct, error: prodErr } = await supabase.from('products').insert({
        supplier_id: user.id,
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
        is_featured: true,
        delivery_time: prod.delivery_time,
        image_urls: [
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80'
        ],
        description: `High-quality ${prod.name} by ${prod.brand}. Best prices guaranteed in ${supplier.city}.`
      }).select('id').single();

      if (prodErr) { console.log(`    ❌ Product error [${prod.name}]: ${prodErr.message}`); continue; }

      // Create promotion for this product
      await supabase.from('supplier_promotions').insert({
        supplier_id: user.id,
        product_id: insertedProduct.id,
        title: `${prod.discount > 0 ? prod.discount + '% OFF — ' : ''}${prod.name}`,
        description: `${user.name} offers ${prod.name} at competitive rates. ${prod.discount > 0 ? `Flat ${prod.discount}% off this season!` : 'Bulk orders welcome.'} Delivery available across Pakistan.`,
        starts_at: today,
        ends_at: futureDate,
        tags: prod.tags,
        is_active: true
      });

      console.log(`    📦 Added: ${prod.name}`);
    }
  }

  console.log('\n✅ All done! Refresh your app to see contractors and supplier products.');
}

fixData().catch(console.error);
