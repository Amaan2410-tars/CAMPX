import {
  addPostComment,
  fetchPosts,
  getLikedSet,
  insertPost,
  isSupabaseConfigured,
  getSupabase,
  navToFeedKind,
  repostPost,
  renderPostCard,
  togglePostLike,
  type FeedPostRow,
} from "@/lib/campxFeed";

function showError(el: HTMLElement | null, msg: string): void {
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
}

function clearError(el: HTMLElement | null): void {
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

async function main(): Promise<void> {
  const nav = document.documentElement.dataset.campxNav;
  const kind = navToFeedKind(nav);
  if (!kind) return;

  const errEl = document.getElementById("campx-feed-error");
  const listEl = document.getElementById("campx-db-posts");
  const wrap = document.getElementById("campx-live-wrap");
  const composer = document.querySelector<HTMLElement>(".campx-composer");
  const bodyEl = document.getElementById("campx-post-body") as HTMLTextAreaElement | null;
  const submitEl = document.getElementById("campx-post-submit");

  if (!listEl) return;

  if (!isSupabaseConfigured()) {
    showError(errEl, "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use live posts.");
    if (composer) composer.style.display = "none";
    return;
  }

  const sb = getSupabase();
  if (!sb) return;

  clearError(errEl);

  async function refresh(): Promise<void> {
    const { data, error } = await fetchPosts(sb, kind);
    if (error) {
      showError(errEl, error.message);
      return;
    }
    clearError(errEl);
    if (!data?.length) {
      listEl.innerHTML =
        '<div class="campx-feed-empty" style="padding:14px;color:var(--text-muted);font-size:13px;text-align:center;border:1px dashed var(--border);border-radius:12px;">No live posts yet — be the first.</div>';
      return;
    }
    const {
      data: { user },
    } = await sb.auth.getUser();
    const ids = data.map((p) => p.id);
    const likedSet =
      user && ids.length ? await getLikedSet(sb, ids, user.id) : new Set();
    listEl.innerHTML = data
      .map((p: FeedPostRow) => renderPostCard(p, { liked: likedSet.has(p.id) }))
      .join("");
  }

  await refresh();

  sb.channel(`campx-feed-${kind}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts", filter: `feed_kind=eq.${kind}` },
      () => {
        void refresh();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_likes" },
      () => {
        void refresh();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_comments" },
      () => {
        void refresh();
      },
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "post_reposts" },
      () => {
        void refresh();
      },
    )
    .subscribe();

  listEl.addEventListener("click", async (e) => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
    if (!t) return;
    const action = t.dataset.action;
    const postId = t.dataset.postId;
    if (!postId || !action) return;

    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      showError(errEl, "Sign in to interact.");
      return;
    }

    if (action === "like") {
      const { error } = await togglePostLike(sb, postId, user.id);
      if (error) showError(errEl, error.message);
      else await refresh();
      return;
    }

    if (action === "comment") {
      const text = window.prompt("Write a comment:");
      if (text == null) return;
      const { error } = await addPostComment(sb, postId, user.id, text);
      if (error) showError(errEl, error.message);
      else await refresh();
      return;
    }

    if (action === "repost") {
      const { error } = await repostPost(sb, postId, user.id);
      if (error) showError(errEl, error.message);
      else await refresh();
    }
  });

  submitEl?.addEventListener("click", async () => {
    const text = bodyEl?.value ?? "";
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) {
      showError(errEl, "Not signed in.");
      return;
    }
    submitEl.disabled = true;
    const { error } = await insertPost(sb, kind, user.id, text);
    submitEl.disabled = false;
    if (error) {
      showError(errEl, error.message);
      return;
    }
    if (bodyEl) bodyEl.value = "";
    await refresh();
  });

  if (wrap) wrap.dataset.campxLive = "ready";
}

void main();
