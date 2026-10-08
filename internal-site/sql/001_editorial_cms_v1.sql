-- SPM institutional site: editorial CMS (DRAFT ONLY; DO NOT RUN IN PRODUCTION WITHOUT QA).
-- Editorial content is never mixed with patient assessments or payment transactions.
BEGIN;
CREATE TABLE IF NOT EXISTS public.spm_site_editors (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.spm_site_editors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.spm_site_editors FROM PUBLIC, anon, authenticated;
-- Only server-side admin can insert the initial editor's UUID.
CREATE OR REPLACE FUNCTION public.spm_is_site_editor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT EXISTS(
  SELECT 1 FROM public.spm_site_editors e
   WHERE e.user_id=(select auth.uid())
 )
$$;
REVOKE ALL ON FUNCTION public.spm_is_site_editor() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spm_is_site_editor() TO authenticated;

CREATE TABLE IF NOT EXISTS public.spm_site_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 120),
 title text NOT NULL CHECK (length(title) BETWEEN 5 AND 180),
 summary text NOT NULL DEFAULT '' CHECK (length(summary)<=500),
 content text NOT NULL DEFAULT '' CHECK (length(content)<=16000),
 category text NOT NULL CHECK(category IN ('educacion','mitos','novedades','bienestar')),
 locale text NOT NULL DEFAULT 'es' CHECK(locale IN ('es','en')),
 cover_url text CHECK (cover_url IS NULL OR (cover_url ~ '^https://' AND length(cover_url)<=900)),
 video_url text CHECK (video_url IS NULL OR (video_url ~ '^https://' AND length(video_url)<=900)),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 published_at timestamptz,
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status <> 'published' OR published_at IS NOT NULL)
);
ALTER TABLE public.spm_site_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.spm_site_posts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.spm_site_posts TO anon, authenticated;
GRANT INSERT, UPDATE ON public.spm_site_posts TO authenticated;
CREATE POLICY spm_site_posts_public_read ON public.spm_site_posts
 FOR SELECT TO anon, authenticated USING(status='published' AND published_at<=now());
CREATE POLICY spm_site_posts_editor_read ON public.spm_site_posts
 FOR SELECT TO authenticated USING ((select public.spm_is_site_editor()));
CREATE POLICY spm_site_posts_editor_insert ON public.spm_site_posts
 FOR INSERT TO authenticated
 WITH CHECK ((select public.spm_is_site_editor()) AND created_by=(select auth.uid()));
CREATE POLICY spm_site_posts_editor_update ON public.spm_site_posts
 FOR UPDATE TO authenticated USING ((select public.spm_is_site_editor()))
 WITH CHECK ((select public.spm_is_site_editor()));
-- There are no browser DELETE grants or policies: archive articles instead of deleting.

-- Public editorial image library with write access for approved editor only.
-- Images max 8 MB; video files hosted/linked separately once storage terms are approved.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('spm-site-images','spm-site-images',true,8388608,ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT(id) DO NOTHING;
CREATE POLICY spm_site_images_public_read ON storage.objects
 FOR SELECT TO anon, authenticated USING(bucket_id='spm-site-images');
CREATE POLICY spm_site_images_editor_upload ON storage.objects
 FOR INSERT TO authenticated
 WITH CHECK(bucket_id='spm-site-images' AND (select public.spm_is_site_editor()));
-- No UPDATE/DELETE policy for public images; replace by uploading a new image.
COMMIT;
