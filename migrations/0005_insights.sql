-- What the dashboard needs that the shop did not record until now.
--
-- Two things, both of them facts the atelier already has and the database did
-- not keep: where a booking came from, and how long the bench actually takes to
-- have a piece ready. Neither one is invented by a query — the columns are
-- filled from the visitor's own URL and from what the owner types in.

-- Attribution. A booking made from an Instagram bio link, a WhatsApp broadcast
-- or a shared post is only distinguishable if the link that brought the visitor
-- carried its tags, so the tags are stored with the row. Old rows keep NULL and
-- the dashboard counts them separately as "not recorded" rather than guessing.
alter table orders add column if not exists source text;
alter table orders add column if not exists campaign text;
create index if not exists orders_source_idx on orders (source) where source is not null;

-- How long the bench needs. `pieces at the bench` is a count of designs, not of
-- stock — nothing here tracks units — so the only honest "should I make more of
-- this?" is: how often is it booked, and how many days does it take to string
-- one. The second number is a fact about the workshop, so the owner enters it;
-- the panel refuses to suggest a quantity until it is set.
create table if not exists bench_settings (
  id integer primary key default 1,
  -- Days from ordering the findings to a finished piece being ready to pack.
  lead_days integer,
  -- How often the owner revisits this plan; the horizon a suggestion covers is
  -- lead time plus this.
  review_days integer,
  updated_at timestamptz not null default now(),
  constraint bench_settings_one_row check (id = 1)
);
