import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedKind = "college" | "explore";

export function navToFeedKind(nav: string | undefined): FeedKind | null {
  if (nav === "college") return "college";
  if (nav === "explore") return "explore";
  return null;
}

export type FeedPostRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  full_name: string | null;
  campx_id: string | null;
  college: string | null;
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatTimeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export async function fetchPosts(
  sb: SupabaseClient,
  kind: FeedKind,
): Promise<{ data: FeedPostRow[] | null; error: Error | null }> {
  const rpc = await sb.rpc("get_feed_with_counts", {
    p_kind: kind,
    p_limit: 40,
  });

  if (!rpc.error && rpc.data) {
    return { data: rpc.data as FeedPostRow[], error: null };
  }

  const { data, error } = await sb
    .from("posts")
    .select("id, body, created_at, author_id, profiles(full_name, campx_id, college)")
    .eq("feed_kind", kind)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return { data: null, error: new Error(error.message) };

  const rows = (data ?? []) as Array<{
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    profiles: { full_name: string | null; campx_id: string | null; college: string | null } | null;
  }>;

  const mapped: FeedPostRow[] = rows.map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      body: r.body,
      created_at: r.created_at,
      author_id: r.author_id,
      like_count: 0,
      comment_count: 0,
      repost_count: 0,
      full_name: p?.full_name ?? null,
      campx_id: p?.campx_id ?? null,
      college: p?.college ?? null,
    };
  });
  return { data: mapped, error: null };
}

export async function insertPost(
  sb: SupabaseClient,
  kind: FeedKind,
  authorId: string,
  body: string,
): Promise<{ error: Error | null }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: new Error("Empty post") };

  const { error } = await sb.from("posts").insert({
    author_id: authorId,
    body: trimmed,
    feed_kind: kind,
  });

  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function togglePostLike(
  sb: SupabaseClient,
  postId: string,
  userId: string,
): Promise<{ liked: boolean; error: Error | null }> {
  const { data: existing } = await sb
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    return { liked: false, error: error ? new Error(error.message) : null };
  }

  const { error } = await sb.from("post_likes").insert({
    post_id: postId,
    user_id: userId,
  });
  return { liked: true, error: error ? new Error(error.message) : null };
}

export async function addPostComment(
  sb: SupabaseClient,
  postId: string,
  userId: string,
  body: string,
): Promise<{ error: Error | null }> {
  const trimmed = body.trim();
  if (!trimmed) return { error: new Error("Empty comment") };
  const { error } = await sb.from("post_comments").insert({
    post_id: postId,
    user_id: userId,
    body: trimmed,
  });
  return { error: error ? new Error(error.message) : null };
}

export async function repostPost(
  sb: SupabaseClient,
  postId: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const { error } = await sb.from("post_reposts").insert({
    post_id: postId,
    user_id: userId,
  });
  if (error?.code === "23505") return { error: null };
  return { error: error ? new Error(error.message) : null };
}

export async function getLikedSet(
  sb: SupabaseClient,
  postIds: string[],
  userId: string,
): Promise<Set<string>> {
  if (!postIds.length) return new Set();
  const { data } = await sb
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);
  return new Set((data ?? []).map((r) => r.post_id as string));
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPostCard(
  post: FeedPostRow,
  opts?: { liked?: boolean },
): string {
  const name = post.full_name?.trim() || post.campx_id || "Student";
  const college = post.college?.trim() || "";
  const ini = initials(name);
  const when = formatTimeAgo(post.created_at);
  const body = escapeHtml(post.body).replace(/\n/g, "<br>");
  const liked = opts?.liked ? " liked" : "";

  return `<div class="post campx-post-live" data-post-id="${escapeHtml(post.id)}">
      <div class="post-header">
        <div class="avatar" style="background: linear-gradient(135deg,#2d1b4e,#3d2b6e);">${escapeHtml(ini)}</div>
        <div class="post-meta">
          <div class="post-author">${escapeHtml(name)}</div>
          <div class="post-info">
            ${college ? `<span class="college-chip">${escapeHtml(college)}</span><span class="dot-sep">·</span>` : ""}
            <span>${escapeHtml(when)}</span>
          </div>
        </div>
        <button type="button" class="post-more" aria-label="More"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
      </div>
      <div class="post-text">${body}</div>
      <div class="campx-post-actions" style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap;align-items:center;font-size:13px;color:var(--text-muted);">
        <button type="button" class="campx-act-like${liked}" data-action="like" data-post-id="${escapeHtml(post.id)}" style="background:none;border:none;color:inherit;cursor:pointer;padding:4px 0;">❤ ${post.like_count}</button>
        <button type="button" data-action="comment" data-post-id="${escapeHtml(post.id)}" style="background:none;border:none;color:inherit;cursor:pointer;padding:4px 0;">💬 ${post.comment_count}</button>
        <button type="button" data-action="repost" data-post-id="${escapeHtml(post.id)}" style="background:none;border:none;color:inherit;cursor:pointer;padding:4px 0;">🔁 ${post.repost_count}</button>
      </div>
    </div>`;
}

export { getSupabase, isSupabaseConfigured };
