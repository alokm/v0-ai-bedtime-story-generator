-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stories table
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  genre text not null,
  theme text,
  context text,
  child_name text,
  content text not null,
  images jsonb default '[]'::jsonb,
  reading_time integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating integer check (rating >= 1 and rating <= 5)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.stories enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Stories policies
create policy "stories_select_own"
  on public.stories for select
  using (auth.uid() = user_id);

create policy "stories_insert_own"
  on public.stories for insert
  with check (auth.uid() = user_id);

create policy "stories_update_own"
  on public.stories for update
  using (auth.uid() = user_id);

create policy "stories_delete_own"
  on public.stories for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index stories_user_id_idx on public.stories(user_id);
create index stories_created_at_idx on public.stories(created_at desc);
