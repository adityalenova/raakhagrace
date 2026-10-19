create table if not exists cart_items (
  id         serial primary key,
  user_id    text not null,
  product_id text not null,
  qty        integer not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists cart_items_user_id_idx on cart_items (user_id);

create table if not exists orders (
  id         serial primary key,
  user_id    text not null,
  items      jsonb not null,
  total      integer not null,
  status     text not null default 'confirmed',
  created_at timestamptz not null default now()
);
create index if not exists orders_user_id_idx on orders (user_id);
