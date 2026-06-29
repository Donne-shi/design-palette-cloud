
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS title_es text,
  ADD COLUMN IF NOT EXISTS excerpt_es text,
  ADD COLUMN IF NOT EXISTS body_es text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title_es text,
  ADD COLUMN IF NOT EXISTS description_es text;

ALTER TABLE public.journal_issues
  ADD COLUMN IF NOT EXISTS title_es text,
  ADD COLUMN IF NOT EXISTS summary_es text;
