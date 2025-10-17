/**
 * ============================================================
 *  File: api.js
 *  Module: API Fetch Wrapper
 *
 *  Description:
 *  A reusable, centralised fetch wrapper for making HTTP requests
 *  to the backend API. Handles base URL resolution, credentials,
 *  authentication headers, and standardised error handling.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost/carbon_app_api";

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorisation: `Bearer ${token}` } : {};
}

function buildUrl(base, endpoint, params) {
  const baseClean = base.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  let url = baseClean + path;

  if (params && typeof params === "object" && Object.keys(params).length) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v.forEach((vv) => qs.append(k, vv));
      else qs.append(k, String(v));
    }
    url += (url.includes("?") ? "&" : "?") + qs.toString();
  }
  return url;
}

export async function apiRequest(endpoint, options = {}) {
  const url = buildUrl(API_BASE, endpoint, options.params);

  const isJsonBody = options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob);

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...options.headers,
    },
    credentials: "include",
    body: isJsonBody ? JSON.stringify(options.body) : options.body,
  });

  let data = {};
  try { data = await res.json(); } catch { data = {}; }   // ← fallback to {}

  if (!res.ok) {
    const msg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ------------------------------------------------------------
 *  Shorthand API methods (with `params` support)
 * ------------------------------------------------------------ */
export const api = {
  get:    (endpoint, opts = {})            => apiRequest(endpoint, { method: "GET",    ...opts }),
  delete: (endpoint, opts = {})            => apiRequest(endpoint, { method: "DELETE", ...opts }),
  post:   (endpoint, body, opts = {})      => apiRequest(endpoint, { method: "POST",   body, ...opts }),
  put:    (endpoint, body, opts = {})      => apiRequest(endpoint, { method: "PUT",    body, ...opts }),
  patch:  (endpoint, body, opts = {})      => apiRequest(endpoint, { method: "PATCH",  body, ...opts }),
};

