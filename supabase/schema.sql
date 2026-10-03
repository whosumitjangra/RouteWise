-- ====================================================================
-- RouteWise - Supabase Database Schema & RLS Policies
-- Multi-Modal Travel & Budget Comparison Engine
-- ====================================================================

-- 1. Create table for User Search & Route History
create table if not exists public.saved_routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  max_budget numeric not null,
  priority_mode text not null check (priority_mode in ('fastest', 'cheapest', 'balanced')),
  selected_mode text,
  route_payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.saved_routes enable row level security;

-- 3. RLS Select Policy
create policy "Users can view their own saved routes" 
on public.saved_routes for select 
using (auth.uid() = user_id or auth.uid() is null);

-- 4. RLS Insert Policy
create policy "Users can insert their own saved routes" 
on public.saved_routes for insert 
with check (auth.uid() = user_id or auth.uid() is null);

-- 5. RLS Delete Policy
create policy "Users can delete their own saved routes" 
on public.saved_routes for delete 
using (auth.uid() = user_id or auth.uid() is null);

-- 6. Indexing for fast search retrieval
create index if not exists idx_saved_routes_user_created 
on public.saved_routes (user_id, created_at desc);

-- 7. Optional Regional Fare Matrix Table for GTFS/transit overrides
create table if not exists public.fare_matrices (
  id uuid default gen_random_uuid() primary key,
  region text not null,
  mode text not null,
  base_fare numeric not null,
  per_km_rate numeric not null,
  surge_multiplier numeric default 1.0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
