
CREATE TABLE public.news_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  original_title TEXT NOT NULL,
  original_excerpt TEXT,
  title_en TEXT,
  title_zh TEXT,
  excerpt_en TEXT,
  excerpt_zh TEXT,
  category TEXT,
  cover_url TEXT,
  published_at_source TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  published_article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT news_drafts_status_check CHECK (status IN ('pending','published','ignored')),
  CONSTRAINT news_drafts_source_url_unique UNIQUE (source_url)
);

CREATE INDEX news_drafts_status_idx ON public.news_drafts (status, fetched_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_drafts TO authenticated;
GRANT ALL ON public.news_drafts TO service_role;

ALTER TABLE public.news_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors can view drafts"
  ON public.news_drafts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Admins and editors can modify drafts"
  ON public.news_drafts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Admins and editors can delete drafts"
  ON public.news_drafts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE TRIGGER news_drafts_updated_at
  BEFORE UPDATE ON public.news_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
