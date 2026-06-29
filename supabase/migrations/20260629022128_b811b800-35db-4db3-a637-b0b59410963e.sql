
ALTER TABLE public.news_drafts
  ADD COLUMN IF NOT EXISTS relevance_score integer,
  ADD COLUMN IF NOT EXISTS relevance_reason text,
  ADD COLUMN IF NOT EXISTS is_top_pick boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scored_at timestamptz;
CREATE INDEX IF NOT EXISTS news_drafts_score_idx ON public.news_drafts (is_top_pick DESC, relevance_score DESC NULLS LAST, fetched_at DESC);
