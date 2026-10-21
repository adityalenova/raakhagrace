-- Every mail the site tries to send, and what the sending service said back.
--
-- This exists because "the verification code never arrived" is otherwise
-- unanswerable after an hour: the app writes the failure to the runtime log and
-- the hosting plan keeps runtime logs for well under an hour, so by the time
-- anyone looks the evidence is gone. A row here outlives that window and says
-- precisely whether the message was accepted by the mailer, refused by it, or
-- skipped because no sender is configured.
--
-- `recipient` is masked at write time (first letter plus the domain). The point
-- of the row is to tell one address from another and to read the refusal text;
-- keeping the full address would put a second copy of customer mail data in a
-- table that no erase path walks, and the data-protection page does not
-- describe one.
create table if not exists mail_log (
  id bigserial primary key,
  -- 'code' | 'welcome' | 'link' | 'enquiry' | 'order' | 'probe' | 'mail'
  kind text not null,
  recipient text not null,
  -- 'sent' (the mailer accepted it) | 'refused' (it rejected the request)
  -- | 'skipped' (no sender configured, so nothing left this server)
  status text not null,
  -- The mailer's message id when accepted; its error text when refused; a short
  -- reason when skipped. Truncated by the writer.
  detail text,
  created_at timestamptz not null default now()
);

-- The admin panel reads the tail of this table in reverse time order, and
-- nothing else queries it.
create index if not exists mail_log_created_at_idx on mail_log (created_at desc);
