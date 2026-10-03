import { useSyncExternalStore } from 'react';

type Restriction = 'review' | 'relax' | 'awareness' | 'ready';
type Host = {
  getState(): Record<string, unknown>;
  write(key: string, value: unknown): boolean;
  getContext(): { day: number; origin: 'dailyPlan' | 'erectile' | 'library'; restriction: Restriction };
  close(): Promise<boolean | undefined>;
};
function resolveHost(): Host | null {
  try {
    if (window.parent === window || window.parent.location.origin !== window.location.origin) return null;
    return (window.parent as Window & { SPM_PELVIC_LAB_HOST?: Host }).SPM_PELVIC_LAB_HOST ?? null;
  } catch { return null; }
}
export const host = resolveHost();
export function load<T>(key: string, fallback: T): T {
  const value = host?.getState()[key];
  return value === undefined ? fallback : value as T;
}
export function save(key: string, value: unknown) { return host?.write(key, value) ?? false; }
const subscribe = (fn: () => void) => {
  window.addEventListener('spm:pelvic-context', fn);
  return () => window.removeEventListener('spm:pelvic-context', fn);
};
export function useRestriction(): Restriction {
  return useSyncExternalStore(subscribe, () => host?.getContext().restriction ?? 'review');
}
