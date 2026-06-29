UPDATE public.news_drafts
SET status = 'ignored', is_top_pick = false
WHERE status = 'pending'
  AND source_name IN ('Vatican News', 'Catholic News Agency');