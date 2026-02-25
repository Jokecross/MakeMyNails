-- ============================================
-- MakeMyNails — Schema complet
-- ============================================

-- 1. PROFILES (extension de auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  credits integer default 3 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. PACKS (packs de crédits disponibles)
create table public.packs (
  id text primary key,
  name text not null,
  price decimal(10,2) not null,
  credits integer not null,
  description text,
  popular boolean default false,
  active boolean default true,
  stripe_price_id text,
  created_at timestamptz default now() not null
);

alter table public.packs enable row level security;

create policy "Packs are readable by everyone"
  on public.packs for select
  using (true);

insert into public.packs (id, name, price, credits, description, popular) values
  ('pack_decouverte', 'Découverte', 4.99, 5, '5 visualisations', false),
  ('pack_reguliere', 'Régulière', 9.99, 15, '15 visualisations', true),
  ('pack_addict', 'Addict', 19.99, 40, '40 visualisations', false);


-- 3. PURCHASES (historique d'achats)
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pack_id text references public.packs(id) not null,
  credits integer not null,
  amount decimal(10,2) not null,
  stripe_session_id text,
  status text default 'completed' not null,
  created_at timestamptz default now() not null
);

alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
  on public.purchases for insert
  with check (auth.uid() = user_id);


-- 4. VISUALIZATIONS (historique des visualisations)
create table public.visualizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_image_url text,
  result_image_url text,
  shape text not null,
  style text not null,
  length text not null,
  status text default 'pending' not null,
  created_at timestamptz default now() not null
);

alter table public.visualizations enable row level security;

create policy "Users can view their own visualizations"
  on public.visualizations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own visualizations"
  on public.visualizations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own visualizations"
  on public.visualizations for update
  using (auth.uid() = user_id);


-- 5. TRIGGER : créer un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    3
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 6. TRIGGER : mettre à jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();


-- 7. FUNCTION : acheter un pack (ajoute les crédits + enregistre l'achat)
create or replace function public.purchase_pack(p_pack_id text, p_stripe_session_id text default null)
returns json as $$
declare
  v_pack public.packs;
  v_purchase public.purchases;
begin
  select * into v_pack from public.packs where id = p_pack_id and active = true;
  if not found then
    raise exception 'Pack not found or inactive';
  end if;

  insert into public.purchases (user_id, pack_id, credits, amount, stripe_session_id, status)
  values (auth.uid(), v_pack.id, v_pack.credits, v_pack.price, p_stripe_session_id, 'completed')
  returning * into v_purchase;

  update public.profiles
  set credits = credits + v_pack.credits
  where id = auth.uid();

  return json_build_object(
    'purchase_id', v_purchase.id,
    'credits_added', v_pack.credits,
    'new_balance', (select credits from public.profiles where id = auth.uid())
  );
end;
$$ language plpgsql security definer;


-- 8. FUNCTION : utiliser un crédit (décrémenter + créer une visualisation)
create or replace function public.use_credit(p_shape text, p_style text, p_length text, p_original_image_url text default null)
returns json as $$
declare
  v_credits integer;
  v_viz public.visualizations;
begin
  select credits into v_credits from public.profiles where id = auth.uid();

  if v_credits <= 0 then
    raise exception 'No credits remaining';
  end if;

  update public.profiles
  set credits = credits - 1
  where id = auth.uid();

  insert into public.visualizations (user_id, original_image_url, shape, style, length, status)
  values (auth.uid(), p_original_image_url, p_shape, p_style, p_length, 'pending')
  returning * into v_viz;

  return json_build_object(
    'visualization_id', v_viz.id,
    'credits_remaining', v_credits - 1
  );
end;
$$ language plpgsql security definer;


-- 9. FUNCTION : marquer une visualisation comme terminée
create or replace function public.complete_visualization(p_viz_id uuid, p_result_image_url text)
returns void as $$
begin
  update public.visualizations
  set result_image_url = p_result_image_url, status = 'completed'
  where id = p_viz_id and user_id = auth.uid();
end;
$$ language plpgsql security definer;


-- 10. INDEX pour les performances
create index idx_purchases_user_id on public.purchases(user_id);
create index idx_purchases_created_at on public.purchases(created_at desc);
create index idx_visualizations_user_id on public.visualizations(user_id);
create index idx_visualizations_created_at on public.visualizations(created_at desc);
create index idx_profiles_credits on public.profiles(credits);


-- 11. STORAGE bucket pour les images
insert into storage.buckets (id, name, public)
values ('nail-images', 'nail-images', true)
on conflict do nothing;

create policy "Anyone can view nail images"
  on storage.objects for select
  using (bucket_id = 'nail-images');

create policy "Authenticated users can upload nail images"
  on storage.objects for insert
  with check (bucket_id = 'nail-images' and auth.role() = 'authenticated');

create policy "Users can update their own images"
  on storage.objects for update
  using (bucket_id = 'nail-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own images"
  on storage.objects for delete
  using (bucket_id = 'nail-images' and auth.uid()::text = (storage.foldername(name))[1]);
