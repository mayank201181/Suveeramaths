// ============================================================
// Suveera's Magic Maths — local cache (offline fallback)
// The server is the source of truth; this mirrors progress in
// the browser so the app keeps working with no connection.
// ============================================================

const KEY = 'suveera_maths_v2';
const NAME_KEY = 'suveera_maths_name';

export function cacheGet() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
export function cacheSet(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); if (state && state.name) localStorage.setItem(NAME_KEY, state.name); }
  catch { /* storage full or blocked */ }
}
export function cacheClear() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(NAME_KEY); } catch { /* ignore */ }
}
export function lastName() {
  try { return localStorage.getItem(NAME_KEY) || (cacheGet() || {}).name || null; } catch { return null; }
}
