import { useMemo, useSyncExternalStore } from 'react';

export type Restriction = 'review' | 'relax' | 'awareness' | 'ready';
export type HostContext = {
  day: number;
  origin: 'dailyPlan' | 'erectile' | 'library';
  restriction: Restriction;
  intent?: 'daily-relax' | 'scheduled' | 'library';
  activityId?: string | null;
};
type Host = {
  getState(): Record<string, unknown>;
  write(key: string, value: unknown): boolean;
  getContext(): HostContext;
  onResult?(result: Record<string, unknown>): boolean;
  close(): Promise<boolean | undefined>;
};
function resolveHost(): Host | null {
  try {
    if (window.parent === window) return null;
    // Access itself is protected by the browser's same-origin policy. A srcdoc
    // review frame inherits its parent's origin, although location.origin is null.
    return (window.parent as Window & { SPM_PELVIC_LAB_HOST?: Host }).SPM_PELVIC_LAB_HOST ?? null;
  } catch { return null; }
}
export const host = resolveHost();
export function load<T>(key: string, fallback: T): T {
  const value = host?.getState()[key];
  return value === undefined ? fallback : value as T;
}
export function save(key: string, value: unknown) { return host?.write(key, value) ?? false; }
export function readContext(): HostContext | null {
  try { return host?.getContext() ?? null; } catch { return null; }
}
export function contextKey(context: HostContext | null): string {
  return JSON.stringify(context ? [context.day, context.origin, context.intent ?? '', context.activityId ?? ''] : null);
}
const subscribe = (fn: () => void) => {
  window.addEventListener('spm:pelvic-context', fn);
  return () => window.removeEventListener('spm:pelvic-context', fn);
};
export function useRestriction(): Restriction {
  return useSyncExternalStore(subscribe, () => readContext()?.restriction ?? 'review');
}
export function useHostContext(): HostContext | null {
  // A primitive snapshot avoids returning a new object on each external-store read.
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify(readContext()), () => 'null');
  return useMemo(() => JSON.parse(snapshot) as HostContext | null, [snapshot]);
}
