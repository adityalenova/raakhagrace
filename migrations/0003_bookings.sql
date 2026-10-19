-- Bookings that are taken on WhatsApp, and the fields the atelier needs to
-- run them. The site never charges a card: a customer assembles a cart here,
-- sends it to us on WhatsApp, and the order lives in this table so both sides
-- can see the same status.
--
-- `orders` already existed for site-placed carts; rather than a parallel table
-- with half the same columns, a WhatsApp booking is an order row with a
-- reference, a channel, and the customer's contact details.

alter table orders alter column user_id drop not null;

alter table orders add column if not exists ref text;
alter table orders add column if not exists channel text not null default 'site';
alter table orders add column if not exists contact_name text;
alter table orders add column if not exists contact_phone text;
alter table orders add column if not exists contact_email text;
alter table orders add column if not exists address text;
alter table orders add column if not exists tracking text;
alter table orders add column if not exists notes text;
alter table orders add column if not exists updated_at timestamptz not null default now();

-- The reference is what the customer quotes on WhatsApp, so it must be unique
-- and it must be indexed for the "claim this booking" lookup.
create unique index if not exists orders_ref_key on orders (ref) where ref is not null;
create index if not exists orders_contact_phone_idx on orders (contact_phone)
  where contact_phone is not null;
create index if not exists orders_status_idx on orders (status);
