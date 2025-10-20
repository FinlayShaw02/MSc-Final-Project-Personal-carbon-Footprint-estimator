/**
 * ============================================================
 *  File: Friends.jsx
 *  Page: Friends
 *
 *  Description:
 *  Social graph management: view friends, handle requests (incoming/outgoing),
 *  discover new connections, and manage blocks. Includes search, optimistic UI
 *  updates, toasts, and confirm dialogs.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";

/* ------------ helpers (colors, initials) ------------ */
// Tiny utility set for avatars and safe numeric ops
const rgb = (s) => `rgb(${s})`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const hash = (s) =>
  Array.from(s).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
// Deterministic pastel-ish color from a name
const nameToColor = (name = "") => {
  const h = Math.abs(hash(name)) % 360, s = 55, l = 45;
  const a = (k) => (k + h / 30) % 12;
  const f = (n) =>
    l - (s * Math.min(l, 100 - l) * Math.max(-1, Math.min(a(n) - 3, Math.min(9 - a(n), 1)))) / 100;
  const r = clamp(Math.round((f(0) / 100) * 255), 0, 255);
  const g = clamp(Math.round((f(8) / 100) * 255), 0, 255);
  const b = clamp(Math.round((f(4) / 100) * 255), 0, 255);
  return `${r} ${g} ${b}`;
};
// User initials for avatar chip
const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

// Normalise various API user shapes into one UI-friendly shape
const normaliseUser = (u) => ({
  id: Number(u.id),
  name: u.name ?? "",
  username: u.username ?? "",
  color: u.color ?? nameToColor(u.name ?? "U"),
});

/* ------------------ tiny UI atoms ------------------- */
// Circle avatar with initials; background color derived from name
function Avatar({ name, color }) {
  return (
    <div
      className="flex items-center justify-center rounded-full text-primaryContrast"
      style={{ width: 36, height: 36, background: rgb(color || "34 197 94"), boxShadow: "0 1px 2px rgb(0 0 0 / 0.25)" }}
      aria-hidden
    >
      <span className="text-xs font-semibold leading-none">{initials(name)}</span>
    </div>
  );
}
// Auto dismissing toast (2.5s) for success/error notices
function Toast({ toast, onClose }) {
  useEffect(() => { if (!toast) return; const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [toast, onClose]);
  if (!toast) return null;
  const tone = toast.type === "error"
    ? "text-[rgb(var(--error-fg))] bg-[rgb(var(--error-bg))] border-[rgb(var(--error-fg))]/25"
    : "text-[rgb(var(--success-fg))] bg-[rgb(var(--success-bg))] border-[rgb(var(--success-fg))]/20";
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-3 py-2 text-sm rounded border shadow-subtle ${tone}`}>{toast.msg}</div>
    </div>
  );
}
// Minimal confirm dialog with variant button tone
function Confirm({ open, title, message, confirmText, tone = "danger", onCancel, onConfirm }) {
  if (!open) return null;
  const btnTone = tone === "danger"
    ? "border-[rgb(var(--error-fg))] text-[rgb(var(--error-fg))] hover:bg-[rgb(var(--error-bg))]/20"
    : "border-primary text-primary hover:bg-primary/10";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/50 backdrop-blur-sm">
      <div className="w-[min(92vw,480px)] rounded-xl border border-border bg-surface shadow-subtle p-4">
        <h3 className="font-semibold text-fg mb-1">{title}</h3>
        <p className="text-sm text-muted mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded border border-border hover:bg-surfaceVariant">Cancel</button>
          <button onClick={onConfirm} className={`px-3 py-1.5 rounded border ${btnTone}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
// Standard row layout for a user with action buttons on the right
function Row({ user, right }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface shadow-subtle">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={user.name} color={user.color} />
        <div className="min-w-0">
          <div className="font-medium text-fg truncate">{user.name}</div>
          {user.username && <div className="text-xs text-muted truncate">@{user.username}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

/* ------------------- API mapping -------------------- */
// Thin client wrapping PHP endpoints; returns normalised shapes
const API = {
  async overview() {
    const [friendsRes, incomingRes, outgoingRes] = await Promise.all([
      api.get("/friends_list.php"),
      api.get("/friends_requests.php?type=incoming"),
      api.get("/friends_requests.php?type=outgoing"),
    ]);

    const friends = Array.isArray(friendsRes?.friends) ? friendsRes.friends.map(normaliseUser) : [];
    const mapPending = (rows = []) =>
      rows.map((r) => ({ ...normaliseUser({ id: r.other_user_id, name: r.name }), requestId: Number(r.id) }));
    const incoming = mapPending(incomingRes?.requests || []);
    const outgoing = mapPending(outgoingRes?.requests || []);

    // Suggestions exclude anyone already connected or pending either way
    let suggestions = [];
    try {
      const res = await api.get("/friends_suggest.php?limit=50");
      const rows = Array.isArray(res?.results) ? res.results : [];
      const connected = new Set([
        ...friends.map((u) => u.id),
        ...incoming.map((u) => u.id),
        ...outgoing.map((u) => u.id),
      ]);
      suggestions = rows.map(normaliseUser).filter((u) => !connected.has(u.id));
    } catch { suggestions = []; }

    return { friends, incoming, outgoing, suggestions };
  },

  async search(q) {
    const data = await api.get(`/friends_search.php?q=${encodeURIComponent(q)}`);
    const rows = Array.isArray(data?.results) ? data.results : [];
    return rows.map(normaliseUser);
  },

  // Request / act endpoints (accept/decline/cancel/block etc.)
  requestById(userId)     { return api.post("/friend_request_send.php", { addressee_id: userId }); },
  acceptByUserId(otherId) { return api.post("/friend_request_act.php", { other_user_id: otherId, action: "accept"  }); },
  declineByUserId(otherId){ return api.post("/friend_request_act.php", { other_user_id: otherId, action: "decline" }); },
  cancelByUserId(otherId) { return api.post("/friend_request_act.php", { other_user_id: otherId, action: "cancel"  }); },
  remove(userId)          { return api.post("/friends_remove.php", { friend_id: userId }); },
  block(userId)           { return api.post("/blocks.php", { user_id: userId, action: "block"   }); },
  unblock(userId)         { return api.post("/blocks.php", { user_id: userId, action: "unblock" }); },
  blocks()                { return api.get("/blocks_list.php"); },
};

/* -------------------- Page -------------------------- */
// Main Friends page: tabs for Friends / Requests / Discover / Blocked
export default function Friends() {
  const [tab, setTab] = useState("friends");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // gate for async actions to avoid double taps

  const [confirm, setConfirm] = useState({ open: false, action: null, user: null });

  // Lists by status
  const [friends, setFriends]   = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // NEW: blocks state
  const [blocked, setBlocked]     = useState([]); // users I blocked
  const [blockedBy, setBlockedBy] = useState([]); // users who blocked me

  // initial load: friends/requests/suggestions + block lists
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const d = await API.overview();
        if (cancel) return;
        setFriends(d.friends);
        setIncoming(d.incoming);
        setOutgoing(d.outgoing);
        setDiscover(d.suggestions);

        // load blocks separately
        try {
          const bl = await API.blocks();
          if (cancel) return;
          setBlocked((bl.blocked || []).map(normaliseUser));
          setBlockedBy((bl.blocked_me || []).map(normaliseUser));
        } catch { /* ignore */ }
      } catch (e) {
        setToast({ type: "error", msg: e?.message || "Failed to load friends." });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  // debounced server search
  const qRef = useRef("");
  useEffect(() => {
    if (tab !== "discover") { setSearchResults(null); return; }
    const q = query.trim();
    qRef.current = q;
    if (q.length < 2) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const res = await API.search(q);
        const connected = new Set([...friends, ...incoming, ...outgoing].map((u) => u.id));
        const filtered = res.filter((u) => !connected.has(u.id));
        if (qRef.current === q) setSearchResults(filtered);
      } catch (e) {
        setToast({ type: "error", msg: e?.message || "Search failed." });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, tab, friends, incoming, outgoing]);

  // Local filtering across tabs based on search query
  const q = query.trim().toLowerCase();
  const filteredFriends  = useMemo(() => friends.filter((u) => (u.name + u.username).toLowerCase().includes(q)), [friends, q]);
  const filteredIncoming = useMemo(() => incoming.filter((u) => (u.name + u.username).toLowerCase().includes(q)), [incoming, q]);
  const filteredOutgoing = useMemo(() => outgoing.filter((u) => (u.name + u.username).toLowerCase().includes(q)), [outgoing, q]);

  // Discover shows either live search results or capped suggestions
  const discoverPool = searchResults ?? discover;
  const filteredDiscover = useMemo(() => {
    const list = discoverPool.filter((u) => (u.name + u.username).toLowerCase().includes(q));
    return searchResults ? list : list.slice(0, 5); // cap suggestions to 5
  }, [discoverPool, q, searchResults]);

  // Utility: run an async action while setting busy flag
  const doWithBusy = async (fn) => { if (busy) return; setBusy(true); try { await fn(); } finally { setBusy(false); } };

  // Optimistic UI flows for each action, with rollback on failure
  const accept = (user) => doWithBusy(async () => {
    const prevIn = [...incoming], prevFr = [...friends];
    setIncoming((a) => a.filter((x) => x.requestId !== user.requestId));
    setFriends((a) => [user, ...a]);
    try { await API.acceptByUserId(user.id); setToast({ type: "ok", msg: `You are now friends with ${user.name}.` }); }
    catch (e) { setIncoming(prevIn); setFriends(prevFr); setToast({ type: "error", msg: e?.message || "Failed to accept." }); }
  });
  const decline = (user) => doWithBusy(async () => {
    const prevIn = [...incoming];
    setIncoming((a) => a.filter((x) => x.requestId !== user.requestId));
    try { await API.declineByUserId(user.id); setToast({ type: "ok", msg: `Declined ${user.name}.` }); }
    catch (e) { setIncoming(prevIn); setToast({ type: "error", msg: e?.message || "Failed to decline." }); }
  });
  const cancel = (user) => doWithBusy(async () => {
    const prevOut = [...outgoing];
    setOutgoing((a) => a.filter((x) => x.requestId !== user.requestId));
    try { await API.cancelByUserId(user.id); setToast({ type: "ok", msg: `Cancelled request to ${user.name}.` }); }
    catch (e) { setOutgoing(prevOut); setToast({ type: "error", msg: e?.message || "Failed to cancel." }); }
  });
  const addFriend = (user) => doWithBusy(async () => {
    const prevSearch = searchResults ? [...searchResults] : null;
    const prevDisc = [...discover], prevOut = [...outgoing];
    if (searchResults) setSearchResults((a) => a.filter((x) => x.id !== user.id));
    setDiscover((a) => a.filter((x) => x.id !== user.id));
    setOutgoing((a) => [user, ...a]);
    try { await API.requestById(user.id); setToast({ type: "ok", msg: `Request sent to ${user.name}.` }); }
    catch (e) {
      if (prevSearch) setSearchResults(prevSearch);
      setDiscover(prevDisc); setOutgoing(prevOut);
      setToast({ type: "error", msg: e?.message || "Failed to send request." });
    }
  });
  const unfriend = (user) => doWithBusy(async () => {
    const prevFr = [...friends];
    setFriends((a) => a.filter((x) => x.id !== user.id));
    try { await API.remove(user.id); setToast({ type: "ok", msg: `Removed ${user.name}.` }); }
    catch (e) { setFriends(prevFr); setToast({ type: "error", msg: e?.message || "Failed to remove friend." }); }
  });
  const block = (user) => doWithBusy(async () => {
    const prevFr = [...friends], prevIn = [...incoming], prevOut = [...outgoing], prevDisc = [...discover];
    setFriends((a) => a.filter((x) => x.id !== user.id));
    setIncoming((a) => a.filter((x) => x.id !== user.id));
    setOutgoing((a) => a.filter((x) => x.id !== user.id));
    setDiscover((a) => a.filter((x) => x.id !== user.id));
    try {
      await API.block(user.id);
      setBlocked((a) => [{ id: user.id, name: user.name, color: user.color }, ...a]); // keep local list in sync
      setToast({ type: "ok", msg: `Blocked ${user.name}.` });
    } catch (e) {
      setFriends(prevFr); setIncoming(prevIn); setOutgoing(prevOut); setDiscover(prevDisc);
      setToast({ type: "error", msg: e?.message || "Failed to block user." });
    }
  });
  const unblock = (user) => doWithBusy(async () => {
    const prev = [...blocked];
    setBlocked((a) => a.filter((x) => x.id !== user.id));
    try { await API.unblock(user.id); setToast({ type: "ok", msg: `Unblocked ${user.name}.` }); }
    catch (e) { setBlocked(prev); setToast({ type: "error", msg: e?.message || "Failed to unblock." }); }
  });

  // Confirm dialog orchestration
  const ask = (action, user) => setConfirm({ open: true, action, user });
  const onConfirm = async () => {
    const { action, user } = confirm;
    setConfirm({ open: false, action: null, user: null });
    if (!user) return;
    if (action === "unfriend") await unfriend(user);
    if (action === "block")    await block(user);
    if (action === "unblock")  await unblock(user);
  };

  return (
    <div className="p-4 text-fg">
      {/* Header with totals + search */}
      <header className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Friends</h1>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs px-2 py-1 rounded-full border border-border bg-surfaceVariant">Friends: <strong className="ml-1">{friends.length}</strong></span>
          <span className="text-xs px-2 py-1 rounded-full border border-border bg-surfaceVariant">Pending: <strong className="ml-1">{incoming.length + outgoing.length}</strong></span>
        </div>
        <div className="w-full sm:w-72">
          <input
            placeholder="Search people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full mt-1 border border-border rounded px-3 py-2 bg-surface text-fg placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {[
          { id: "friends",  label: "Friends" },
          { id: "requests", label: "Requests" },
          { id: "discover", label: "Discover" },
          { id: "blocked",  label: "Blocked"  }, // NEW
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${tab === t.id ? "bg-primary text-primaryContrast border-transparent" : "bg-surfaceVariant border-border hover:bg-surface"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        // Skeleton-ish loading placeholder
        <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">Loading…</div>
      ) : (
        <>
          {/* FRIENDS */}
          {tab === "friends" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFriends.length === 0 && <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">No friends found.</div>}
              {filteredFriends.map((u) => (
                <Row
                  key={u.id}
                  user={u}
                  right={
                    <>
                      {/* Message button removed */}
                      <button onClick={() => ask("unfriend", u)} className="px-2.5 py-1.5 rounded border border-border hover:bg-surfaceVariant">Unfriend</button>
                      <button onClick={() => ask("block", u)} className="px-2.5 py-1.5 rounded border text-[rgb(var(--error-fg))] border-[rgb(var(--error-fg))] hover:bg-[rgb(var(--error-bg))]/15">Block</button>
                    </>
                  }
                />
              ))}
            </section>
          )}

          {/* REQUESTS */}
          {tab === "requests" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Incoming</h3>
                <div className="space-y-2">
                  {filteredIncoming.length === 0 && <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">No incoming requests.</div>}
                  {filteredIncoming.map((u) => (
                    <Row
                      key={u.requestId}
                      user={u}
                      right={
                        <>
                          <button onClick={() => accept(u)} disabled={busy} className="px-2.5 py-1.5 rounded border border-transparent bg-primary text-primaryContrast hover:opacity-90 disabled:opacity-60">Accept</button>
                          <button onClick={() => decline(u)} disabled={busy} className="px-2.5 py-1.5 rounded border border-border hover:bg-surfaceVariant disabled:opacity-60">Decline</button>
                        </>
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Outgoing</h3>
                <div className="space-y-2">
                  {filteredOutgoing.length === 0 && <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">No sent requests.</div>}
                  {filteredOutgoing.map((u) => (
                    <Row
                      key={u.requestId}
                      user={u}
                      right={<button onClick={() => cancel(u)} disabled={busy} className="px-2.5 py-1.5 rounded border border-border hover:bg-surfaceVariant disabled:opacity-60">Cancel</button>}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* DISCOVER */}
          {tab === "discover" && (
            <section className="space-y-2">
              <div className="text-sm text-muted">
                {searchResults ? "Search results" : "People you might know"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDiscover.length === 0 ? (
                  <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">
                    {query.trim().length < 2 ? "Type at least 2 characters to search." : "No results."}
                  </div>
                ) : (
                  filteredDiscover.map((u) => (
                    <Row
                      key={u.id}
                      user={u}
                      right={<button onClick={() => addFriend(u)} disabled={busy} className="px-2.5 py-1.5 rounded border border-transparent bg-primary text-primaryContrast hover:opacity-90 disabled:opacity-60">Add friend</button>}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {/* BLOCKED */}
          {tab === "blocked" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">You blocked</h3>
                <div className="space-y-2">
                  {blocked.length === 0 && (
                    <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">No blocked users.</div>
                  )}
                  {blocked.map((u) => (
                    <Row
                      key={u.id}
                      user={u}
                      right={
                        <button
                          onClick={() => ask("unblock", u)}
                          disabled={busy}
                          className="px-2.5 py-1.5 rounded border border-border hover:bg-surfaceVariant disabled:opacity-60"
                        >
                          Unblock
                        </button>
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Blocked by others</h3>
                <div className="space-y-2">
                  {blockedBy.length === 0 && (
                    <div className="text-muted text-sm border border-border rounded-lg p-4 bg-surface">No one has blocked you.</div>
                  )}
                  {blockedBy.map((u) => (
                    <Row key={u.id} user={u} right={<span className="text-xs text-muted">You can’t interact</span>} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Global confirm + toast */}
      <Confirm
        open={confirm.open}
        title={
          confirm.action === "block"   ? "Block user?"
          : confirm.action === "unblock" ? "Unblock user?"
          : "Remove friend?"
        }
        message={
          confirm.action === "block"
            ? "They won’t be able to add you again. You can unblock later."
            : confirm.action === "unblock"
              ? "They’ll be able to find and add you again."
              : "You’ll remove each other from friends. You can re-add anytime."
        }
        confirmText={confirm.action === "block" ? "Block" : confirm.action === "unblock" ? "Unblock" : "Remove"}
        tone={confirm.action === "block" ? "danger" : "neutral"}
        onCancel={() => setConfirm({ open: false, action: null, user: null })}
        onConfirm={onConfirm}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}


