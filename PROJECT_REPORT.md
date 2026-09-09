# BuildWise AI — Project Report

## Overview

**BuildWise AI** is a full-stack web application for the Pakistani construction market. It allows homeowners to get AI-powered construction cost estimates, match with verified contractors, and purchase construction materials from suppliers — all in one platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Routing** | React Router v6 |
| **State / Data Fetching** | TanStack Query (React Query v5) |
| **Forms** | React Hook Form + Zod validation |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS (custom design tokens) |
| **Backend / Auth / DB** | Supabase (PostgreSQL + Row Level Security) |
| **AI Estimation** | Supabase Edge Functions (Deno) + NVIDIA API (LLaMA 3.3 70B) |
| **Realtime** | Supabase Realtime (chat messages, notifications) |
| **Storage** | Supabase Storage (profile/portfolio/product images) |
| **Hosting** | Vercel (frontend) + Supabase (backend) |
| **Version Control** | GitHub (`abdullahh23/FYP-`) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel (Frontend)              │
│  React + Vite + TanStack Query + React Router    │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────┐
│              Supabase Cloud (Backend)            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────┐  │
│  │  PostgreSQL  │  │ Edge Function│  │Storage │  │
│  │  + RLS       │  │ estimate-cost│  │Buckets │  │
│  └─────────────┘  └──────┬───────┘  └────────┘  │
│                          │                       │
│                   ┌──────▼───────┐               │
│                   │  NVIDIA API  │               │
│                   │  LLaMA 3.3   │               │
│                   └──────────────┘               │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables
| Table | Purpose |
|-------|---------|
| `users` | All users (homeowner/contractor/supplier/admin) |
| `contractor_profiles` | Contractor details, rating, experience, portfolio |
| `supplier_profiles` | Supplier company info, city, delivery, rating |
| `products` | Supplier products (cement, steel, tiles, etc.) |
| `supplier_promotions` | Promotional offers tied to products |
| `product_reviews` | Homeowner reviews for products |
| `projects` | Homeowner construction projects + AI estimate JSON |
| `quotations` | Contractor quotes for projects |
| `material_quote_requests` | Material quotes from suppliers |
| `material_quote_items` | Individual items in a material quote |
| `conversations` | Chat thread index (homeowner ↔ contractor/supplier) |
| `chat_messages` | Individual chat messages (text/image/file) |
| `notifications` | In-app notifications for all roles |
| `project_progress_updates` | Construction progress tracking |
| `project_images` | Images uploaded for a project |

### Key Database Functions (RPCs)
| Function | Description |
|----------|-------------|
| `match_contractors_for_project` | Scores and ranks contractors by budget, city, rating, experience |
| `recommended_products_for_project` | Matches products to project tags and material quality |
| `relevant_promotions_for_project` | Finds active promotions matching project tags |
| `accept_project_quotation` | Accepts one quote and rejects all others atomically |
| `refresh_contractor_rating` | Auto-updates contractor rating after each review |

---

## User Roles & Features

### 🏠 Homeowner
- Create construction projects (plot size, floors, city, quality, features)
- Get **AI-powered cost estimates** (PKR breakdown by category)
- View **matched contractors** ranked by score
- Request quotations from contractors
- Chat with contractors (real-time messaging)
- Browse **recommended products** matched to project
- Request material quotes from suppliers
- Chat with suppliers
- Accept/reject quotations
- View project journey / progress tracker
- Duplicate, archive, delete projects
- View contractor and supplier **public profile pages**

### 🔨 Contractor
- View and manage incoming project requests
- Submit quotations with price, duration, notes
- Chat with homeowners (real-time)
- Track active and completed projects
- Manage profile: bio, experience, portfolio images, specialization
- Receive notifications

### 🏪 Supplier
- Add/edit/delete products (steel, cement, tiles, paint, etc.)
- Create promotional offers with date ranges and tags
- Respond to material quote requests (price, delivery, discount)
- Chat with homeowners
- Manage company profile (logo, banner, delivery info, address)

### 🔑 Admin
- User management (verify contractors/suppliers)
- View all projects, quotations, and transactions

---

## AI Cost Estimation

- **Engine:** NVIDIA API (LLaMA 3.3 70B Instruct) via Supabase Edge Function
- **Input:** Project details (area, floors, city, soil type, quality, features)
- **Output JSON fields:**
  - `material_cost`, `labour_cost`, `foundation_cost`, `structure_cost`
  - `roofing_cost`, `plumbing_cost`, `electrical_cost`, `paint_cost`
  - `tiles_cost`, `doors_windows_cost`, `miscellaneous_cost`
  - `total_estimate_min`, `total_estimate_max`
  - `timeline`, `confidence`, `suggestions`, `risk_factors`
- **Retry logic:** 3 attempts with different temperature settings
- **Fallback:** If AI fails, error is saved and user can retry

---

## Seed Data (Pakistani Market)

**Contractors:**
| Name | City | Specialization | Rating |
|------|------|----------------|--------|
| Mughal Construction Co. | Lahore | Turnkey Construction & Grey Structure | 4.8 |
| Tariq Builders | Karachi | Modern Finishing & Interior | 4.5 |
| Zaman Estate & Builders | Islamabad | Smart Homes & Luxury Villas | 4.9 |
| Al-Madina Contractors | Faisalabad | Commercial & Residential | 4.2 |
| Bismillah Associates | Rawalpindi | Cost-Effective Housing | 4.4 |

**Suppliers & Products:**
| Supplier | Products |
|----------|---------|
| Lahore Ceramics & Tiles | Master Tiles 24x24, Johal Marble |
| Pak Steel Traders | Grade 60 Steel Rebar, Maple Leaf Cement |
| Master Paints Official | Weathercoat, Interior Emulsion, ICI Dulux |
| Itefaq Hardware & Electrical | Fast Cables, LED Lights, UPVC Pipes |
| Ravi Sand & Bricks | Red Bricks, River Sand, Stone Crush |

---

## Public Profile Pages

- `/contractors/:id` — Full contractor profile with bio, portfolio grid, stats, contact
- `/suppliers/:id` — Full supplier profile with product listing, delivery info, about

---

## Routing Structure

```
/ ..................... Landing Page
/login ................ Login
/signup ............... Sign Up
/forgot-password ...... Password Reset
/verify-email ......... Email Verification
/choose-role .......... Role Selection (homeowner/contractor/supplier)
/account-status ....... Suspended account notice
/dashboard ............ Role-based dashboard (HomeOwner/Contractor/Supplier)
/dashboard/available-projects ... Contractor project browser
/dashboard/messages ........... Contractor chat inbox
/dashboard/notifications ....... Notifications page
/dashboard/projects/:id/results . AI Estimate + Matches results
/contractors/:id .... Public Contractor Profile
/suppliers/:id ...... Public Supplier Profile
/marketplace/products/:id ..... Product Details Page
```

---

## Bugs Fixed (This Session)

| # | File | Bug | Fix Applied |
|---|------|-----|-------------|
| 1 | `AuthContext.tsx` | App stuck on **"Loading BuildWise AI"** when Supabase unreachable | Added 7s timeout + error handling so loading always resolves |
| 2 | `SupplierProfilePage.tsx` | Wrong table `supplier_products` (doesn't exist) | Changed to `products` table |
| 3 | `SupplierProfilePage.tsx` | Invalid `<Badge variant="secondary">` prop | Removed invalid prop (Badge only accepts `tone`) |
| 4 | `types/index.ts` | `MaterialQuoteRequest` missing `created_at` field | Added `created_at: string` to type |
| 5 | `ContractorDashboard.tsx` | `projects?.id` could be `undefined` (TS error) | Added `?? ''` fallback |
| 6 | `HomeownerDashboard.tsx` | `supplier?.company_name` doesn't exist on `Profile` type | Changed to `supplier?.name` |
| 7 | `scripts/seed-pakistani-data.ts` | Products inserted into non-existent `supplier_products` table | Fixed to use `products` table |
| 8 | Seed data | Contractors/suppliers had `is_verified=false` so never appeared in matches | Set `is_verified=true` via fix script |
| 9 | Seed data | No `supplier_promotions` created, so Supplier Offers section was empty | Created promotions for each product |

---

## Environment Variables Required

```env
VITE_SUPABASE_URL=https://ggmumkronjfjiwildsov.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # scripts only
NVIDIA_API_KEY=<nvidia_api_key>               # Supabase Edge Function secret
```

---

## Repository
**GitHub:** [abdullahh23/FYP-](https://github.com/abdullahh23/FYP-)  
**Live Preview:** http://localhost:5173/ (local dev)
