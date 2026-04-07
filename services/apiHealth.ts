/**
 * Bull Bridge — API Health Check Utility
 * Lightweight, non-breaking module to verify backend connectivity.
 *
 * - Does NOT modify any existing endpoints, routes, or response schemas.
 * - Does NOT remove or alter the mock fallback system.
 * - Safe to import from any component without side-effects.
 */

// ─── Shared Base URL ─────────────────────────
// Single source of truth for the FastAPI backend address.
export const API_BASE_URL = 'http://10.234.78.118:8000/api';

// ─── Types ───────────────────────────────────

export interface HealthCheckResult {
  /** 'ok' when backend responds, 'unreachable' otherwise */
  status: 'ok' | 'unreachable';
  /** Round-trip latency in milliseconds (-1 if unreachable) */
  latencyMs: number;
  /** ISO timestamp of when the check was performed */
  checkedAt: string;
}

// ─── Internal State ──────────────────────────

const HEALTH_TIMEOUT_MS = 800; // Reduced from 3000ms — near-instant fallback
const HEALTH_CACHE_TTL_MS = 30_000; // Cache result for 30s — don't ping on every stock load

let _lastResult: HealthCheckResult = {
  status: 'unreachable',
  latencyMs: -1,
  checkedAt: new Date().toISOString(),
};
let _lastCheckedAt = 0; // timestamp of last actual network check

// ─── Public API ──────────────────────────────

/**
 * Ping the backend health endpoint and return connectivity status.
 * Cached for 30s to prevent N pings per page load. Always resolves — never throws.
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  // Return cached result if fresh enough
  if (Date.now() - _lastCheckedAt < HEALTH_CACHE_TTL_MS) {
    return _lastResult;
  }

  const start = Date.now();
  _lastCheckedAt = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      _lastResult = {
        status: 'ok',
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    } else {
      _lastResult = {
        status: 'unreachable',
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
      };
    }
  } catch {
    _lastResult = {
      status: 'unreachable',
      latencyMs: -1,
      checkedAt: new Date().toISOString(),
    };
  }
  return _lastResult;
}

/**
 * Return the most recent health check result without making a new request.
 */
export function getApiStatus(): HealthCheckResult {
  return { ..._lastResult };
}
