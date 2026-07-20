-- Users Table (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  role text check (role in ('B2C', 'B2B', 'ADMIN')) default 'B2C',
  b2b_status text check (b2b_status in ('PENDING', 'APPROVED', 'REJECTED')) default 'PENDING',
  name text,
  business_name text,
  tax_id text,
  wompi_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);

-- Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  sku text,
  inventory_count int default 0,
  image_url text,
  is_active boolean default true
);
alter table public.products enable row level security;
create policy "Anyone can view active products" on public.products for select using (is_active = true);

-- Price Tiers
create table public.price_tiers (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products on delete cascade not null,
  target_role text check (target_role in ('B2C', 'B2B')) not null,
  min_quantity int default 1,
  unit_price decimal(10,2) not null
);
alter table public.price_tiers enable row level security;
create policy "Anyone can view price tiers" on public.price_tiers for select using (true);

-- Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users,
  status text check (status in ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')) default 'PENDING',
  total_amount decimal(12,2) not null,
  shipping_address text,
  estimated_delivery_days int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

-- Order Items
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products not null,
  quantity int not null,
  unit_price decimal(10,2) not null
);
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists(select 1 from public.orders where id = order_items.order_id and user_id = auth.uid())
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'B2C'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
