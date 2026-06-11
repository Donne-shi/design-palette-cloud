
-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ARTICLES
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'news',
  slug text UNIQUE,
  title_zh text NOT NULL,
  title_en text,
  excerpt_zh text,
  excerpt_en text,
  body_zh text,
  body_en text,
  cover_url text,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Staff can view all articles" ON public.articles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Staff can manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh text NOT NULL,
  title_en text,
  description_zh text,
  description_en text,
  location text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  capacity int,
  cover_url text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Staff can view all events" ON public.events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Staff can manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- JOURNAL ISSUES
CREATE TABLE public.journal_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volume int NOT NULL,
  issue_number int NOT NULL,
  title_zh text NOT NULL,
  title_en text,
  summary_zh text,
  summary_en text,
  cover_url text,
  pdf_url text,
  published_at date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(volume, issue_number)
);
GRANT SELECT ON public.journal_issues TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_issues TO authenticated;
GRANT ALL ON public.journal_issues TO service_role;
ALTER TABLE public.journal_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published issues" ON public.journal_issues FOR SELECT USING (status = 'published');
CREATE POLICY "Staff can view all issues" ON public.journal_issues FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE POLICY "Staff can manage issues" ON public.journal_issues FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
CREATE TRIGGER trg_journal_updated BEFORE UPDATE ON public.journal_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER_ROLES management policies (admins manage roles; admins/editors view all)
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Staff view all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));
