import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedKind = "college" | "explore";

export function navToFeedKind(nav: string | undefined): FeedKind | null {
  if (nav === "college") return "college";
  if (nav === "explore") return "explore";
  return null;
}

type ProfileMini = {
  full_name: string | null;
  campx_id: string | null;
  college: string | null;
};

export type PostWithAuthor = {
  id: string;
  body: string;
  created_at: string;
  profiles: ProfileMini | ProfileMini[] | null;
};

function singleProfile(p: PostWithAuthor["profiles"]): ProfileMini | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

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
): Promise<{ data: PostWithAuthor[] | null; error: Error | null }> {
  const { data, error } = await sb
    .from("posts")
    .select("id, body, created_at, profiles(full_name, campx_id, college)")
    .eq("feed_kind", kind)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return { data: null, error: new Error(error.message) };
  return { data: (data as PostWithAuthor[]) ?? [], error: null };
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

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderPostCard(post: PostWithAuthor): string {
  const prof = singleProfile(post.profiles);
  const name = prof?.full_name?.trim() || prof?.campx_id || "Student";
  const college = prof?.college?.trim() || "";
  const ini = initials(name);
  const when = formatTimeAgo(post.created_at);
  const body = escapeHtml(post.body).replace(/\n/g, "<br>");

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
    </div>`;
}

export { getSupabase, isSupabaseConfigured };
