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

const HEALTH_TIMEOUT_MS = 3_000;

let _lastResult: HealthCheckResult = {
  status: 'unreachable',
  latencyMs: -1,
  checkedAt: new Date().toISOString(),
};

// ─── Public API ──────────────────────────────

/**
 * Ping the backend health endpoint and return connectivity status.
 * Always resolves — never throws.
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      _lastResult = {
        status: data?.status === 'ok' ? 'ok' : 'ok', // any 200 = reachable
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
