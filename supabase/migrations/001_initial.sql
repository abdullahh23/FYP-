create extension if not exists "pgcrypto";

create type public.user_role as enum ('homeowner', 'contractor', 'supplier', 'admin');
create type public.account_status as enum ('active', 'pending', 'suspended');
create type public.project_status as enum ('Planning', 'Contracted', 'In Progress', 'Completed');
create type public.quotation_status as enum ('requested', 'submitted', 'accepted', 'rejected');
create type public.message_type as enum ('text', 'image');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null unique,
  phone text,
  profile_image_url text,
  role public.user_role,
  city text,
  is_verified boolean not null default false,
  verification_date timestamptz,
  verification_notes text,
  account_status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contractor_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  experience_years integer not null default 0 check (experience_years >= 0),
  specialization text not null default 'Residential Construction',
  bio text,
  completed_projects integer not null default 0 check (completed_projects >= 0),
  min_budget numeric(14,2),
  max_budget numeric(14,2),
  portfolio_urls text[] not null default '{}',
  average_rating numeric(3,2) not null default 0 check (average_rating >= 0 and average_rating <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  homeowner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  plot_size numeric(12,2) not null,
  covered_area numeric(12,2) not null,
  floors integer not null,
  basement boolean not null default false,
  city text not null,
  soil_type text not null,
  construction_type text not null,
  material_quality text not null,
  interior_finish text not null,
  exterior_finish text not null,
  parking boolean not null default false,
  solar boolean not null default false,
  smart_home boolean not null default false,
  garden boolean not null default false,
  swimming_pool boolean not null default false,
  tags text[] not null default '{}',
  status public.project_status not null default 'Planning',
  ai_estimate_json jsonb,
  ai_error text,
  ai_estimated_at timestamptz,
  accepted_quotation_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  homeowner_id uuid not null references public.users(id) on delete cascade,
  contractor_id uuid not null references public.users(id) on delete cascade,
  amount numeric(14,2),
  duration_days integer,
  notes text,
  timeline text,
  status public.quotation_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, contractor_id)
);

alter table public.projects
  add constraint projects_accepted_quotation_id_fkey foreign key (accepted_quotation_id) references public.quotations(id) on delete set null;

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  quotation_id uuid references public.quotations(id) on delete set null,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message_type public.message_type not null default 'text',
  body text,
  image_url text,
  created_at timestamptz not null default now(),
  constraint chat_content_check check ((message_type = 'text' and body is not null) or (message_type = 'image' and image_url is not null))
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null,
  price numeric(14,2) not null check (price >= 0),
  discount numeric(5,2) not null default 0 check (discount >= 0 and discount <= 100),
  image_urls text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supplier_promotions (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  starts_at date not null,
  ends_at date not null,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_promotions_date_check check (ends_at >= starts_at)
);

create table public.contractor_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  homeowner_id uuid not null references public.users(id) on delete cascade,
  contractor_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  unique(project_id, homeowner_id, contractor_id)
);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index users_verified_idx on public.users(is_verified, account_status);
create index projects_homeowner_idx on public.projects(homeowner_id, created_at desc);
create index projects_tags_idx on public.projects using gin(tags);
create index quotations_project_idx on public.quotations(project_id);
create index quotations_contractor_idx on public.quotations(contractor_id);
create index chat_project_created_idx on public.chat_messages(project_id, created_at);
create index products_supplier_idx on public.products(supplier_id);
create index products_tags_idx on public.products using gin(tags);
create index promotions_tags_idx on public.supplier_promotions using gin(tags);
create index reviews_contractor_idx on public.contractor_reviews(contractor_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_touch before update on public.users for each row execute function public.touch_updated_at();
create trigger contractor_profiles_touch before update on public.contractor_profiles for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger quotations_touch before update on public.quotations for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger promotions_touch before update on public.supplier_promotions for each row execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, phone)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.match_contractors_for_project(project_id_input uuid)
returns table (
  user_id uuid,
  name text,
  email text,
  phone text,
  city text,
  profile_image_url text,
  is_verified boolean,
  experience_years integer,
  specialization text,
  completed_projects integer,
  average_rating numeric,
  min_budget numeric,
  max_budget numeric,
  portfolio_urls text[],
  match_score numeric
)
language sql
security definer
set search_path = public
as $$
  with project as (
    select * from public.projects where id = project_id_input and homeowner_id = auth.uid()
  ), budget as (
    select p.*, coalesce((p.ai_estimate_json->>'total_estimate_max')::numeric, p.covered_area * 5000) as max_estimate
    from project p
  )
  select
    u.id,
    u.name,
    u.email,
    u.phone,
    u.city,
    u.profile_image_url,
    u.is_verified,
    cp.experience_years,
    cp.specialization,
    cp.completed_projects,
    cp.average_rating,
    cp.min_budget,
    cp.max_budget,
    cp.portfolio_urls,
    (
      case when u.city = b.city then 30 else 0 end +
      case when u.is_verified then 25 else 0 end +
      least(cp.experience_years, 20) * 1.2 +
      cp.average_rating * 6 +
      least(cp.completed_projects, 100) * 0.25 +
      case when lower(cp.specialization) like '%' || lower(b.construction_type) || '%' then 8 else 0 end +
      case when (cp.min_budget is null or cp.min_budget <= b.max_estimate) and (cp.max_budget is null or cp.max_budget >= b.max_estimate * 0.55) then 12 else 0 end
    )::numeric as match_score
  from budget b
  join public.users u on u.role = 'contractor' and u.account_status = 'active' and u.is_verified = true
  join public.contractor_profiles cp on cp.user_id = u.id
  order by match_score desc, cp.average_rating desc, cp.completed_projects desc;
$$;

create or replace function public.relevant_promotions_for_project(project_id_input uuid)
returns setof public.supplier_promotions
language sql
security definer
set search_path = public
as $$
  select sp.*
  from public.projects p
  join public.supplier_promotions sp on sp.is_active = true and sp.tags && p.tags
  join public.users supplier on supplier.id = sp.supplier_id and supplier.role = 'supplier' and supplier.is_verified = true and supplier.account_status = 'active'
  where p.id = project_id_input
    and p.homeowner_id = auth.uid()
    and current_date between sp.starts_at and sp.ends_at
  order by (
    select count(*)
    from unnest(sp.tags) tag
    where tag = any(p.tags)
  ) desc, sp.created_at desc;
$$;

create or replace function public.accept_project_quotation(quotation_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_quote public.quotations%rowtype;
begin
  select * into target_quote from public.quotations where id = quotation_id_input and homeowner_id = auth.uid() and status = 'submitted';
  if not found then
    raise exception 'Submitted quotation not found for this homeowner.';
  end if;

  update public.quotations set status = 'rejected' where project_id = target_quote.project_id and id <> target_quote.id and status in ('requested', 'submitted');
  update public.quotations set status = 'accepted' where id = target_quote.id;
  update public.projects set accepted_quotation_id = target_quote.id, status = 'Contracted' where id = target_quote.project_id;
end;
$$;

create or replace function public.refresh_contractor_rating()
returns trigger
language plpgsql
as $$
begin
  update public.contractor_profiles
  set average_rating = coalesce((select avg(rating)::numeric(3,2) from public.contractor_reviews where contractor_id = new.contractor_id), 0)
  where user_id = new.contractor_id;
  return new;
end;
$$;

create trigger contractor_reviews_refresh_rating after insert or update on public.contractor_reviews for each row execute function public.refresh_contractor_rating();

alter table public.users enable row level security;
alter table public.contractor_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.quotations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.products enable row level security;
alter table public.supplier_promotions enable row level security;
alter table public.contractor_reviews enable row level security;
alter table public.project_images enable row level security;

create policy "Users read own or verified public profiles" on public.users for select using (
  id = auth.uid() or (account_status = 'active' and is_verified = true and role in ('contractor', 'supplier'))
);
create policy "Users insert own profile" on public.users for insert with check (id = auth.uid());
create policy "Users update own non-admin profile" on public.users for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Contractors manage own profile" on public.contractor_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Homeowners read verified contractor profiles" on public.contractor_profiles for select using (
  exists (select 1 from public.users u where u.id = contractor_profiles.user_id and u.role = 'contractor' and u.is_verified = true and u.account_status = 'active')
);

create policy "Homeowners manage own projects" on public.projects for all using (homeowner_id = auth.uid()) with check (homeowner_id = auth.uid());
create policy "Contractors read requested projects" on public.projects for select using (
  exists (select 1 from public.quotations q where q.project_id = projects.id and q.contractor_id = auth.uid())
);

create policy "Homeowners request and read quotations" on public.quotations for all using (homeowner_id = auth.uid()) with check (homeowner_id = auth.uid());
create policy "Contractors read assigned quotations" on public.quotations for select using (contractor_id = auth.uid());
create policy "Contractors submit own quotations" on public.quotations for update using (contractor_id = auth.uid()) with check (contractor_id = auth.uid());

create policy "Chat participants read messages" on public.chat_messages for select using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Chat participants send messages" on public.chat_messages for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.quotations q
    where q.project_id = chat_messages.project_id
      and q.id = coalesce(chat_messages.quotation_id, q.id)
      and ((q.homeowner_id = auth.uid() and q.contractor_id = chat_messages.receiver_id) or (q.contractor_id = auth.uid() and q.homeowner_id = chat_messages.receiver_id))
  )
);

create policy "Suppliers manage own products" on public.products for all using (supplier_id = auth.uid()) with check (supplier_id = auth.uid());
create policy "Homeowners read verified supplier products" on public.products for select using (
  exists (select 1 from public.users u where u.id = products.supplier_id and u.role = 'supplier' and u.is_verified = true and u.account_status = 'active')
);

create policy "Suppliers manage own promotions" on public.supplier_promotions for all using (supplier_id = auth.uid()) with check (supplier_id = auth.uid());
create policy "Homeowners read active verified promotions" on public.supplier_promotions for select using (
  is_active = true and exists (select 1 from public.users u where u.id = supplier_promotions.supplier_id and u.role = 'supplier' and u.is_verified = true and u.account_status = 'active')
);

create policy "Project participants manage reviews" on public.contractor_reviews for all using (homeowner_id = auth.uid() or contractor_id = auth.uid()) with check (homeowner_id = auth.uid());
create policy "Project participants manage images" on public.project_images for all using (
  uploaded_by = auth.uid() or exists (select 1 from public.projects p where p.id = project_images.project_id and p.homeowner_id = auth.uid())
) with check (uploaded_by = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-images', 'profile-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-images', 'project-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio-images', 'portfolio-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('chat-images', 'chat-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Authenticated users upload images" on storage.objects for insert to authenticated with check (
  bucket_id in ('profile-images', 'project-images', 'portfolio-images', 'product-images', 'chat-images')
);
create policy "Authenticated users update own images" on storage.objects for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "Authenticated users delete own images" on storage.objects for delete to authenticated using (owner = auth.uid());
create policy "Public image read" on storage.objects for select using (
  bucket_id in ('profile-images', 'project-images', 'portfolio-images', 'product-images', 'chat-images')
);
