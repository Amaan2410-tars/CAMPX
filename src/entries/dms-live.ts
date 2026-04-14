import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { decryptFromSenderEphemeral, encryptForRecipient, generateIdentityKeypair } from "@/lib/e2ee";

async function main(): Promise<void> {
  const host = document.getElementById("campx-dms-live");
  if (!host) return;
  if (!isSupabaseConfigured()) {
    host.innerHTML = "";
    return;
  }
  const sb = getSupabase();
  if (!sb) return;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    host.innerHTML = '<span style="color:#f87171;">Sign in to load live DMs.</span>';
    return;
  }

  host.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="font-weight:600;color:var(--text);font-size:13px;">Live (Supabase)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <input id="campx-dm-peer" type="text" placeholder="Peer user UUID" style="flex:1;min-width:180px;padding:8px 10px;border-radius:8px;border:1px solid var(--border2);background:var(--surface2);color:var(--text);font-size:12px;" />
        <button type="button" id="campx-dm-open" style="padding:8px 12px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:12px;cursor:pointer;">Open / create</button>
      </div>
      <div id="campx-dm-thread" style="max-height:140px;overflow:auto;font-size:12px;color:var(--text-sub);white-space:pre-wrap;"></div>
      <div style="display:flex;gap:6px;">
        <input id="campx-dm-msg" type="text" placeholder="Message…" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border2);background:var(--surface2);color:var(--text);font-size:12px;" />
        <button type="button" id="campx-dm-send" style="padding:8px 12px;border-radius:8px;border:none;background:var(--accent);color:#fff;font-size:12px;cursor:pointer;">Send</button>
      </div>
    </div>`;

  let activeConv: string | null = null;
  let activePeer: string | null = null;
  let myPrivJwk: JsonWebKey | null = null;

  async function loadThread(): Promise<void> {
    const thread = document.getElementById("campx-dm-thread");
    if (!thread || !activeConv) return;
    const { data, error } = await sb
      .from("messages")
      .select("e2ee_ciphertext, e2ee_nonce, e2ee_ephemeral_pub_jwk, created_at, sender_id")
      .eq("conversation_id", activeConv)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) {
      thread.textContent = error.message;
      return;
    }
    const rows = (data ?? []) as Array<{
      sender_id: string;
      created_at: string;
      e2ee_ciphertext: string | null;
      e2ee_nonce: string | null;
      e2ee_ephemeral_pub_jwk: JsonWebKey | null;
    }>;
    const lines: string[] = [];
    for (const m of rows) {
      if (!m.e2ee_ciphertext || !m.e2ee_nonce || !m.e2ee_ephemeral_pub_jwk || !myPrivJwk) continue;
      try {
        const text = await decryptFromSenderEphemeral(m.e2ee_ciphertext, m.e2ee_nonce, m.e2ee_ephemeral_pub_jwk, myPrivJwk);
        lines.push(`${String(m.sender_id).slice(0, 8)}…: ${text}`);
      } catch {
        lines.push(`${String(m.sender_id).slice(0, 8)}…: [decrypt failed]`);
      }
    }
    thread.textContent = lines.join("\n");
  }

  // Ensure identity keypair exists and public key is stored on profile
  const privRaw = localStorage.getItem("campx_dm_identity_priv_jwk");
  const pubRaw = localStorage.getItem("campx_dm_identity_pub_jwk");
  if (privRaw && pubRaw) {
    myPrivJwk = JSON.parse(privRaw) as JsonWebKey;
  } else {
    const kp = await generateIdentityKeypair();
    localStorage.setItem("campx_dm_identity_priv_jwk", JSON.stringify(kp.privateJwk));
    localStorage.setItem("campx_dm_identity_pub_jwk", JSON.stringify(kp.publicJwk));
    myPrivJwk = kp.privateJwk;
    await sb.from("profiles").update({ dm_identity_pub_jwk: kp.publicJwk }).eq("id", user.id);
  }

  document.getElementById("campx-dm-open")?.addEventListener("click", async () => {
    const peer = (document.getElementById("campx-dm-peer") as HTMLInputElement | null)?.value?.trim();
    if (!peer) return;
    const { data, error } = await sb.rpc("get_or_create_dm", { _other: peer });
    if (error) {
      host.insertAdjacentHTML(
        "beforeend",
        `<div style="color:#f87171;font-size:11px;">${error.message}</div>`,
      );
      return;
    }
    activeConv = data as string;
    activePeer = peer;
    await loadThread();
    sb.channel(`dm-${activeConv}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConv}`,
        },
        () => {
          void loadThread();
        },
      )
      .subscribe();
  });

  document.getElementById("campx-dm-send")?.addEventListener("click", async () => {
    if (!activeConv || !user) return;
    const input = document.getElementById("campx-dm-msg") as HTMLInputElement | null;
    const body = input?.value?.trim() ?? "";
    if (!body) return;
    if (!activePeer) return;
    const { data: peerProfile } = await sb
      .from("profiles")
      .select("dm_identity_pub_jwk")
      .eq("id", activePeer)
      .maybeSingle();
    const peerPub = (peerProfile as { dm_identity_pub_jwk?: JsonWebKey } | null)?.dm_identity_pub_jwk;
    if (!peerPub) {
      host.insertAdjacentHTML("beforeend", `<div style="color:#f87171;font-size:11px;">Peer missing E2EE keys</div>`);
      return;
    }
    const enc = await encryptForRecipient(body, peerPub);
    const { error } = await sb.from("messages").insert({
      conversation_id: activeConv,
      sender_id: user.id,
      body: null,
      e2ee_version: enc.version,
      e2ee_ephemeral_pub_jwk: enc.ephemeralPubJwk,
      e2ee_nonce: enc.nonceB64,
      e2ee_ciphertext: enc.ciphertextB64,
    });
    if (error) {
      host.insertAdjacentHTML(
        "beforeend",
        `<div style="color:#f87171;font-size:11px;">${error.message}</div>`,
      );
      return;
    }
    if (input) input.value = "";
    await loadThread();
  });
}

void main();
