-- ============================================
-- MakeMyNails — Migration 002 : Abonnements + MAJ packs
-- ============================================

-- 1. TABLE SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan text default 'premium' not null,
  status text default 'active' not null,
  credits_per_month integer default 50 not null,
  current_period_start timestamptz default now() not null,
  current_period_end timestamptz default (now() + interval '1 month') not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);

-- 2. Trigger updated_at pour subscriptions
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- 3. MAJ des packs existants (désactiver les anciens, insérer les bons)
update public.packs set active = false where id not in ('pack_decouverte', 'pack_reguliere', 'pack_addict');

-- S'assurer que les bons packs existent avec les bons prix
insert into public.packs (id, name, price, credits, description, popular, active)
values
  ('pack_decouverte', 'Découverte', 4.99, 5, '5 générations', false, true),
  ('pack_reguliere', 'Régulière', 9.99, 15, '15 générations', true, true),
  ('pack_addict', 'Addict', 19.99, 40, '40 générations', false, true)
on conflict (id) do update set
  price = excluded.price,
  credits = excluded.credits,
  description = excluded.description,
  popular = excluded.popular,
  active = excluded.active;

-- 4. FUNCTION : activer un abonnement
create or replace function public.activate_subscription(p_stripe_sub_id text default null, p_stripe_cust_id text default null)
returns json as $$
declare
  v_sub public.subscriptions;
  v_existing public.subscriptions;
begin
  -- Vérifier si un abo actif existe déjà
  select * into v_existing from public.subscriptions
  where user_id = auth.uid() and status = 'active';

  if found then
    -- Renouveler : reset les crédits et la période
    update public.subscriptions
    set
      current_period_start = now(),
      current_period_end = now() + interval '1 month',
      stripe_subscription_id = coalesce(p_stripe_sub_id, stripe_subscription_id),
      stripe_customer_id = coalesce(p_stripe_cust_id, stripe_customer_id)
    where id = v_existing.id
    returning * into v_sub;

    update public.profiles
    set credits = credits + 50
    where id = auth.uid();
  else
    -- Nouvel abonnement
    insert into public.subscriptions (user_id, plan, status, credits_per_month, stripe_subscription_id, stripe_customer_id)
    values (auth.uid(), 'premium', 'active', 50, p_stripe_sub_id, p_stripe_cust_id)
    returning * into v_sub;

    update public.profiles
    set credits = credits + 50
    where id = auth.uid();
  end if;

  return json_build_object(
    'subscription_id', v_sub.id,
    'status', v_sub.status,
    'credits_added', 50,
    'new_balance', (select credits from public.profiles where id = auth.uid()),
    'period_end', v_sub.current_period_end
  );
end;
$$ language plpgsql security definer;

-- 5. MAJ use_credit : les abonnées peuvent utiliser sans limite de crédits standard
create or replace function public.use_credit(p_shape text, p_style text, p_length text, p_original_image_url text default null)
returns json as $$
declare
  v_credits integer;
  v_has_sub boolean;
  v_viz public.visualizations;
begin
  select credits into v_credits from public.profiles where id = auth.uid();

  -- Vérifier si l'utilisatrice a un abonnement actif
  select exists(
    select 1 from public.subscriptions
    where user_id = auth.uid() and status = 'active' and current_period_end > now()
  ) into v_has_sub;

  if not v_has_sub and v_credits <= 0 then
    raise exception 'No credits remaining';
  end if;

  -- Décrémenter le crédit (même pour les abonnées, pour tracker l'usage)
  if v_credits > 0 then
    update public.profiles
    set credits = credits - 1
    where id = auth.uid();
  end if;

  insert into public.visualizations (user_id, original_image_url, shape, style, length, status)
  values (auth.uid(), p_original_image_url, p_shape, p_style, p_length, 'pending')
  returning * into v_viz;

  return json_build_object(
    'visualization_id', v_viz.id,
    'credits_remaining', greatest(v_credits - 1, 0),
    'is_subscribed', v_has_sub
  );
end;
$$ language plpgsql security definer;
