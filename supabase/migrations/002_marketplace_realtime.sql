-- BuildWise marketplace, collaboration, and progress upgrade.
-- Additive migration: preserves existing auth users, projects, quotes, and messages.

alter table public.users alter column is_verified set default true;
update public.users set is_verified = true where role in ('contractor', 'supplier');

alter table public.contractor_profiles
  add column if not exists material_quality_preferences text[] not null default array['Economy', 'Standard', 'Premium', 'Luxury'];

alter table public.quotations alter column status drop default;
alter table public.quotations alter column status type text using status::text;
update public.quotations set status = case status when 'requested' then 'pending' when 'submitted' then 'negotiating' else status end;
alter table public.quotations alter column status set default 'pending';
alter table public.quotations add column if not exists request_notes text;
alter table public.quotations add constraint quotations_status_check check (status in ('pending', 'negotiating', 'accepted', 'rejected')) not valid;

alter table public.projects add column if not exists progress_stage text not null default 'Planning';
alter table public.projects add constraint projects_progress_stage_check check (
  progress_stage in ('Planning', 'Quotation Accepted', 'Construction Started', 'Foundation', 'Grey Structure', 'Finishing', 'Completed')
) not valid;

create table if not exists public.project_progress_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage text not null check (stage in ('Planning', 'Quotation Accepted', 'Construction Started', 'Foundation', 'Grey Structure', 'Finishing', 'Completed')),
  notes text,
  updated_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_name text not null,
  logo_url text,
  banner_url text,
  description text,
  years_in_business integer not null default 0 check (years_in_business >= 0),
  city text,
  address text,
  contact_number text,
  whatsapp text,
  website text,
  delivery_available boolean not null default false,
  minimum_order numeric(14,2) not null default 0 check (minimum_order >= 0),
  average_rating numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists brand text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists unit text not null default 'piece';
alter table public.products add column if not exists delivery_time text;
alter table public.products add column if not exists warranty text;
alter table public.products add column if not exists quality_grade text not null default 'Standard';
alter table public.products add column if not exists manufacturer text;
alter table public.products add column if not exists specifications jsonb not null default '{}'::jsonb;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists is_active boolean not null default true;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  homeowner_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  unique(product_id, homeowner_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  quotation_id uuid references public.quotations(id) on delete set null,
  homeowner_id uuid not null references public.users(id) on delete cascade,
  contractor_id uuid references public.users(id) on delete cascade,
  supplier_id uuid references public.users(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint conversations_peer_check check ((contractor_id is not null) <> (supplier_id is not null))
);
create unique index if not exists conversations_contractor_unique on public.conversations(project_id, contractor_id) where contractor_id is not null;
create unique index if not exists conversations_supplier_unique on public.conversations(project_id, supplier_id) where supplier_id is not null;

insert into public.conversations(project_id, quotation_id, homeowner_id, contractor_id, last_message_at)
select q.project_id, q.id, q.homeowner_id, q.contractor_id, coalesce(max(m.created_at), q.created_at)
from public.quotations q left join public.chat_messages m on m.project_id = q.project_id and ((m.sender_id = q.homeowner_id and m.receiver_id = q.contractor_id) or (m.sender_id = q.contractor_id and m.receiver_id = q.homeowner_id))
group by q.id
on conflict (project_id, contractor_id) where contractor_id is not null do update set quotation_id = excluded.quotation_id;

alter table public.chat_messages alter column message_type drop default;
alter table public.chat_messages drop constraint if exists chat_content_check;
alter table public.chat_messages alter column message_type type text using message_type::text;
alter table public.chat_messages alter column message_type set default 'text';
alter table public.chat_messages add column if not exists conversation_id uuid references public.conversations(id) on delete cascade;
alter table public.chat_messages add column if not exists file_url text;
alter table public.chat_messages add column if not exists file_name text;
alter table public.chat_messages add column if not exists mime_type text;
alter table public.chat_messages add column if not exists seen_at timestamptz;
alter table public.chat_messages add constraint chat_content_v2_check check (
  (message_type = 'text' and body is not null)
  or (message_type = 'image' and image_url is not null)
  or (message_type = 'file' and file_url is not null and file_name is not null)
) not valid;

update public.chat_messages message set conversation_id = conversation.id
from public.conversations conversation
where message.conversation_id is null and message.project_id = conversation.project_id
  and ((message.sender_id = conversation.homeowner_id and message.receiver_id in (conversation.contractor_id, conversation.supplier_id))
    or (message.receiver_id = conversation.homeowner_id and message.sender_id in (conversation.contractor_id, conversation.supplier_id)));

create table if not exists public.typing_presence (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_typing boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.material_quote_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  homeowner_id uuid not null references public.users(id) on delete cascade,
  supplier_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'negotiating', 'accepted', 'rejected')),
  total_price numeric(14,2),
  delivery_time text,
  discount numeric(5,2) not null default 0 check (discount between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_quote_items (
  request_id uuid not null references public.material_quote_requests(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  quoted_unit_price numeric(14,2),
  primary key (request_id, product_id)
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists conversations_homeowner_idx on public.conversations(homeowner_id, last_message_at desc);
create index if not exists conversations_contractor_idx on public.conversations(contractor_id, last_message_at desc);
create index if not exists conversations_supplier_idx on public.conversations(supplier_id, last_message_at desc);
create index if not exists chat_conversation_created_idx on public.chat_messages(conversation_id, created_at);
create index if not exists products_quality_idx on public.products(quality_grade, category) where is_active = true;
create index if not exists material_requests_supplier_idx on public.material_quote_requests(supplier_id, created_at desc);

drop policy if exists "Users read own or verified public profiles" on public.users;
create policy "Users read own or active marketplace profiles" on public.users for select using (
  id = auth.uid() or (account_status = 'active' and role in ('contractor', 'supplier'))
);
drop policy if exists "Homeowners read verified contractor profiles" on public.contractor_profiles;
create policy "Active contractor profiles are public" on public.contractor_profiles for select using (
  exists (select 1 from public.users u where u.id = contractor_profiles.user_id and u.role = 'contractor' and u.account_status = 'active')
);
drop policy if exists "Homeowners read verified supplier products" on public.products;
create policy "Active supplier products are public" on public.products for select using (
  is_active and exists (select 1 from public.users u where u.id = products.supplier_id and u.role = 'supplier' and u.account_status = 'active')
);
drop policy if exists "Homeowners read active verified promotions" on public.supplier_promotions;
create policy "Active supplier promotions are public" on public.supplier_promotions for select using (
  is_active and exists (select 1 from public.users u where u.id = supplier_promotions.supplier_id and u.role = 'supplier' and u.account_status = 'active')
);

alter table public.supplier_profiles enable row level security;
alter table public.product_reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.typing_presence enable row level security;
alter table public.notifications enable row level security;
alter table public.project_progress_updates enable row level security;
alter table public.material_quote_requests enable row level security;
alter table public.material_quote_items enable row level security;

create policy "Suppliers manage own marketplace profile" on public.supplier_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Marketplace supplier profiles are public" on public.supplier_profiles for select using (
  exists (select 1 from public.users u where u.id = supplier_profiles.user_id and u.role = 'supplier' and u.account_status = 'active')
);
create policy "Product reviews are readable" on public.product_reviews for select using (true);
create policy "Homeowners manage own product reviews" on public.product_reviews for all using (homeowner_id = auth.uid()) with check (homeowner_id = auth.uid());
create policy "Conversation participants read" on public.conversations for select using (auth.uid() in (homeowner_id, contractor_id, supplier_id));
create policy "Homeowners create conversations" on public.conversations for insert with check (homeowner_id = auth.uid());
create policy "Participants manage typing" on public.typing_presence for all using (
  exists (select 1 from public.conversations c where c.id = typing_presence.conversation_id and auth.uid() in (c.homeowner_id, c.contractor_id, c.supplier_id))
) with check (user_id = auth.uid());
create policy "Users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Participants read project progress" on public.project_progress_updates for select using (
  exists (select 1 from public.projects p where p.id = project_progress_updates.project_id and (p.homeowner_id = auth.uid() or exists (select 1 from public.quotations q where q.project_id = p.id and q.contractor_id = auth.uid() and q.status = 'accepted')))
);
create policy "Accepted project participants update progress" on public.project_progress_updates for insert with check (
  updated_by = auth.uid() and exists (select 1 from public.projects p where p.id = project_progress_updates.project_id and (p.homeowner_id = auth.uid() or exists (select 1 from public.quotations q where q.project_id = p.id and q.contractor_id = auth.uid() and q.status = 'accepted')))
);
create policy "Material quote participants read" on public.material_quote_requests for select using (homeowner_id = auth.uid() or supplier_id = auth.uid());
create policy "Homeowners request material quotes" on public.material_quote_requests for insert with check (homeowner_id = auth.uid());
create policy "Suppliers respond to material quotes" on public.material_quote_requests for update using (supplier_id = auth.uid()) with check (supplier_id = auth.uid());
create policy "Homeowners accept material quotes" on public.material_quote_requests for update using (homeowner_id = auth.uid()) with check (homeowner_id = auth.uid());
create policy "Material quote participants read items" on public.material_quote_items for select using (
  exists (select 1 from public.material_quote_requests r where r.id = material_quote_items.request_id and auth.uid() in (r.homeowner_id, r.supplier_id))
);
create policy "Homeowners add material quote items" on public.material_quote_items for insert with check (
  exists (select 1 from public.material_quote_requests r where r.id = material_quote_items.request_id and r.homeowner_id = auth.uid())
);

drop policy if exists "Chat participants read messages" on public.chat_messages;
drop policy if exists "Chat participants send messages" on public.chat_messages;
create policy "Conversation participants read messages" on public.chat_messages for select using (
  sender_id = auth.uid() or receiver_id = auth.uid()
);
create policy "Conversation participants send messages" on public.chat_messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from public.conversations c where c.id = chat_messages.conversation_id
      and c.project_id = chat_messages.project_id
      and auth.uid() in (c.homeowner_id, c.contractor_id, c.supplier_id)
      and chat_messages.receiver_id in (c.homeowner_id, c.contractor_id, c.supplier_id)
  )
);
create policy "Recipients mark messages seen" on public.chat_messages for update using (receiver_id = auth.uid()) with check (receiver_id = auth.uid());

create or replace function public.match_contractors_for_project(project_id_input uuid)
returns table (
  user_id uuid, name text, email text, phone text, city text, profile_image_url text, is_verified boolean,
  experience_years integer, specialization text, completed_projects integer, average_rating numeric,
  min_budget numeric, max_budget numeric, portfolio_urls text[], match_score numeric
)
language sql security definer set search_path = public as $$
  with target as (
    select p.*, coalesce((p.ai_estimate_json->>'total_estimate_max')::numeric, p.covered_area * 5000) as budget
    from public.projects p where p.id = project_id_input and p.homeowner_id = auth.uid()
  )
  select u.id, u.name, u.email, u.phone, u.city, u.profile_image_url, true,
    cp.experience_years, cp.specialization, cp.completed_projects, cp.average_rating,
    cp.min_budget, cp.max_budget, cp.portfolio_urls,
    (
      case when (cp.min_budget is null or cp.min_budget <= t.budget) and (cp.max_budget is null or cp.max_budget >= t.budget) then 45
           when (cp.min_budget is null or cp.min_budget <= t.budget * 1.15) and (cp.max_budget is null or cp.max_budget >= t.budget * .85) then 30 else 0 end +
      case when lower(coalesce(u.city, '')) = lower(t.city) then 25 else 0 end +
      least(cp.experience_years, 20) * .6 +
      least(cp.completed_projects, 100) * .08 +
      cp.average_rating * 1.4 +
      case when lower(cp.specialization) like '%' || lower(t.construction_type) || '%' then 2 else 0 end +
      case when t.material_quality = any(cp.material_quality_preferences) then 1 else 0 end
    )::numeric as match_score
  from target t
  join public.users u on u.role = 'contractor' and u.account_status = 'active'
  join public.contractor_profiles cp on cp.user_id = u.id
  order by match_score desc, cp.experience_years desc, cp.completed_projects desc, cp.average_rating desc;
$$;

create or replace function public.recommended_products_for_project(project_id_input uuid)
returns table (product jsonb, supplier jsonb, match_score numeric)
language sql security definer set search_path = public as $$
  with target as (select * from public.projects where id = project_id_input and homeowner_id = auth.uid()), ranked as (
    select p, sp,
      (select count(*) * 20 from unnest(p.tags) tag where tag = any(t.tags)) +
      case when lower(p.quality_grade) = lower(t.material_quality) then 35 else 0 end +
      case when t.solar and (lower(p.category) = 'solar' or p.tags && array['solar','inverter','battery']) then 45 else 0 end +
      case when t.smart_home and (lower(p.category) in ('smart home','security') or p.tags && array['smart-home','security']) then 45 else 0 end +
      case when t.swimming_pool and p.tags && array['pool','waterproofing'] then 45 else 0 end +
      case when t.garden and p.tags && array['garden','outdoor-lighting'] then 45 else 0 end +
      case when t.material_quality = 'Luxury' and p.tags && array['luxury','marble','designer-lighting'] then 35 else 0 end +
      case when p.is_featured then 3 else 0 end as score
    from target t join public.products p on p.is_active
    join public.supplier_profiles sp on sp.user_id = p.supplier_id
    join public.users u on u.id = p.supplier_id and u.account_status = 'active'
  )
  select to_jsonb(p), to_jsonb(sp), score::numeric
  from ranked
  where score > 0
  order by score desc, (p).discount desc, (sp).average_rating desc
  limit 30;
$$;

create or replace function public.relevant_promotions_for_project(project_id_input uuid)
returns setof public.supplier_promotions
language sql security definer set search_path = public as $$
  select promotion.* from public.projects project
  join public.supplier_promotions promotion on promotion.is_active and promotion.tags && project.tags
  join public.users supplier on supplier.id = promotion.supplier_id and supplier.role = 'supplier' and supplier.account_status = 'active'
  where project.id = project_id_input and project.homeowner_id = auth.uid()
    and current_date between promotion.starts_at and promotion.ends_at
  order by (select count(*) from unnest(promotion.tags) tag where tag = any(project.tags)) desc, promotion.created_at desc;
$$;

create or replace function public.create_quote_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
declare conversation_uuid uuid;
begin
  insert into public.conversations(project_id, quotation_id, homeowner_id, contractor_id)
  values (new.project_id, new.id, new.homeowner_id, new.contractor_id)
  on conflict (project_id, contractor_id) where contractor_id is not null
  do update set quotation_id = excluded.quotation_id
  returning id into conversation_uuid;
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  values (new.contractor_id, new.homeowner_id, 'project_request', 'New project request', 'A homeowner requested a construction quotation.', 'quotation', new.id);
  return new;
end;
$$;
drop trigger if exists quotation_create_conversation on public.quotations;
create trigger quotation_create_conversation after insert on public.quotations for each row execute function public.create_quote_conversation();

create or replace function public.create_material_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.conversations(project_id, homeowner_id, supplier_id)
  values (new.project_id, new.homeowner_id, new.supplier_id)
  on conflict (project_id, supplier_id) where supplier_id is not null do nothing;
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  values (new.supplier_id, new.homeowner_id, 'material_quote_request', 'New material quote request', 'A homeowner requested prices for selected products.', 'material_quote', new.id);
  return new;
end;
$$;
drop trigger if exists material_request_create_conversation on public.material_quote_requests;
create trigger material_request_create_conversation after insert on public.material_quote_requests for each row execute function public.create_material_conversation();

create or replace function public.notify_chat_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  values (new.receiver_id, new.sender_id, 'new_message', 'New message', coalesce(new.body, new.file_name, 'Shared an image'), 'conversation', new.conversation_id);
  return new;
end;
$$;
drop trigger if exists chat_message_notify on public.chat_messages;
create trigger chat_message_notify after insert on public.chat_messages for each row execute function public.notify_chat_message();

create or replace function public.notify_quote_response()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status = 'negotiating' then
    insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
    values (new.homeowner_id, new.contractor_id, 'new_quotation', 'New contractor quotation', 'A contractor submitted a price and timeline.', 'quotation', new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists quotation_response_notify on public.quotations;
create trigger quotation_response_notify after update on public.quotations for each row execute function public.notify_quote_response();

create or replace function public.notify_material_response()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and new.status = 'negotiating' then
    insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
    values (new.homeowner_id, new.supplier_id, 'supplier_replied', 'New supplier quotation', 'A supplier responded with price and delivery details.', 'material_quote', new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists material_response_notify on public.material_quote_requests;
create trigger material_response_notify after update on public.material_quote_requests for each row execute function public.notify_material_response();

create or replace function public.accept_project_quotation(quotation_id_input uuid)
returns void language plpgsql security definer set search_path = public as $$
declare target_quote public.quotations%rowtype;
begin
  select * into target_quote from public.quotations where id = quotation_id_input and homeowner_id = auth.uid() and status = 'negotiating';
  if not found then raise exception 'Negotiating quotation not found for this homeowner.'; end if;
  update public.quotations set status = 'rejected' where project_id = target_quote.project_id and id <> target_quote.id and status in ('pending', 'negotiating');
  update public.quotations set status = 'accepted' where id = target_quote.id;
  update public.projects set accepted_quotation_id = target_quote.id, status = 'Contracted', progress_stage = 'Quotation Accepted' where id = target_quote.project_id;
  insert into public.project_progress_updates(project_id, stage, notes, updated_by) values (target_quote.project_id, 'Quotation Accepted', 'Quotation accepted by homeowner.', auth.uid());
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  values (target_quote.contractor_id, auth.uid(), 'quote_accepted', 'Quotation accepted', 'The homeowner accepted your quotation.', 'quotation', target_quote.id);
end;
$$;

create or replace function public.sync_project_progress()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.projects set progress_stage = new.stage, status = case when new.stage = 'Completed' then 'Completed'::public.project_status else status end where id = new.project_id;
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  select p.homeowner_id, new.updated_by, 'project_update', 'Project progress updated', new.stage, 'project', new.project_id from public.projects p where p.id = new.project_id and p.homeowner_id <> new.updated_by;
  return new;
end;
$$;
drop trigger if exists project_progress_sync on public.project_progress_updates;
create trigger project_progress_sync after insert on public.project_progress_updates for each row execute function public.sync_project_progress();

create trigger supplier_profiles_touch before update on public.supplier_profiles for each row execute function public.touch_updated_at();
create trigger material_quotes_touch before update on public.material_quote_requests for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('supplier-assets', 'supplier-assets', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('chat-files', 'chat-files', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

drop policy if exists "Authenticated users upload marketplace files" on storage.objects;
create policy "Suppliers upload own assets" on storage.objects for insert to authenticated with check (
  bucket_id = 'supplier-assets' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Conversation participants upload files" on storage.objects for insert to authenticated with check (
  bucket_id = 'chat-files' and exists (select 1 from public.conversations c where c.id::text = (storage.foldername(name))[1] and auth.uid() in (c.homeowner_id, c.contractor_id, c.supplier_id))
);
create policy "Conversation participants read files" on storage.objects for select to authenticated using (
  bucket_id = 'chat-files' and exists (select 1 from public.conversations c where c.id::text = (storage.foldername(name))[1] and auth.uid() in (c.homeowner_id, c.contractor_id, c.supplier_id))
);
create policy "Public supplier asset read" on storage.objects for select using (bucket_id = 'supplier-assets');

alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.typing_presence;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.project_progress_updates;
