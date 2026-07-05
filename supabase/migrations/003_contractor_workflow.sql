alter table public.projects drop constraint if exists projects_progress_stage_check;
alter table public.projects add constraint projects_progress_stage_check check (
  progress_stage in ('Planning', 'Site Visit', 'Foundation', 'Grey Structure', 'Roof', 'Electrical', 'Plaster', 'Painting', 'Finishing', 'Completed')
) not valid;

alter table public.project_progress_updates drop constraint if exists project_progress_updates_stage_check;
alter table public.project_progress_updates add constraint project_progress_updates_stage_check check (
  stage in ('Planning', 'Site Visit', 'Foundation', 'Grey Structure', 'Roof', 'Electrical', 'Plaster', 'Painting', 'Finishing', 'Completed')
) not valid;

update public.projects set progress_stage = 'Planning' where progress_stage in ('Quotation Accepted', 'Construction Started');
update public.project_progress_updates set stage = 'Planning' where stage in ('Quotation Accepted', 'Construction Started');

create or replace function public.current_user_is_active_contractor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'contractor'
      and account_status = 'active'
  );
$$;

drop policy if exists "Contractors read public homeowner projects" on public.projects;
create policy "Contractors read public homeowner projects" on public.projects for select using (
  public.current_user_is_active_contractor()
);

drop policy if exists "Contractors create own quotations" on public.quotations;
create policy "Contractors create own quotations" on public.quotations for insert with check (
  contractor_id = auth.uid()
  and exists (select 1 from public.projects p where p.id = project_id and p.homeowner_id = homeowner_id)
);

drop policy if exists "Participants create conversations" on public.conversations;
create policy "Participants create conversations" on public.conversations for insert with check (
  auth.uid() in (homeowner_id, contractor_id, supplier_id)
);

drop policy if exists "Contractors read homeowner profiles for projects" on public.users;
create policy "Contractors read homeowner profiles for projects" on public.users for select using (
  role = 'homeowner' and public.current_user_is_active_contractor()
);

create or replace function public.accept_project_quotation(quotation_id_input uuid)
returns void language plpgsql security definer set search_path = public as $$
declare target_quote public.quotations%rowtype;
begin
  select * into target_quote from public.quotations where id = quotation_id_input and homeowner_id = auth.uid() and status = 'negotiating';
  if not found then raise exception 'Negotiating quotation not found for this homeowner.'; end if;
  update public.quotations set status = 'rejected' where project_id = target_quote.project_id and id <> target_quote.id and status in ('pending', 'negotiating');
  update public.quotations set status = 'accepted' where id = target_quote.id;
  update public.projects set accepted_quotation_id = target_quote.id, status = 'Contracted', progress_stage = 'Planning' where id = target_quote.project_id;
  insert into public.project_progress_updates(project_id, stage, notes, updated_by) values (target_quote.project_id, 'Planning', 'Quotation accepted by homeowner.', auth.uid());
  insert into public.notifications(user_id, actor_id, type, title, body, entity_type, entity_id)
  values (target_quote.contractor_id, auth.uid(), 'quote_accepted', 'Quotation accepted', 'The homeowner accepted your quotation.', 'quotation', target_quote.id);
end;
$$;
