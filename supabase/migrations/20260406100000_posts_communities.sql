-- Feeds + communities (MVP). RLS: authenticated read posts; authors manage own rows.

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  feed_kind TEXT NOT NULL CHECK (feed_kind IN ('college', 'explore')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_feed_kind_idx ON public.posts (feed_kind);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_authenticated" ON public.posts;
CREATE POLICY "posts_select_authenticated" ON public.posts
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Communities (catalog + membership)

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "communities_select_authenticated" ON public.communities;
CREATE POLICY "communities_select_authenticated" ON public.communities
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "communities_insert_authenticated" ON public.communities;
CREATE POLICY "communities_insert_authenticated" ON public.communities
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.community_members (
  community_id UUID NOT NULL REFERENCES public.communities (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_members_select" ON public.community_members;
CREATE POLICY "community_members_select" ON public.community_members
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "community_members_insert_self" ON public.community_members;
CREATE POLICY "community_members_insert_self" ON public.community_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_members_delete_self" ON public.community_members;
CREATE POLICY "community_members_delete_self" ON public.community_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
