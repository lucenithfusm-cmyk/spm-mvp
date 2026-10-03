export type CentralContext = { day: number; origin: string; restriction: 'none' | 'review' | 'urgent' };
type Host = { flush: () => Promise<void>; close: () => Promise<boolean>; openControl: () => Promise<void>; getState: () => Record<string, string>; write: (key: string, value: string) => boolean; getContext: () => CentralContext };
declare global { interface Window { SPM_SENSATE_LAB_HOST?: Host } }
export function host(): Host | undefined {
  try { return window.parent !== window ? window.parent.SPM_SENSATE_LAB_HOST : undefined; } catch { return undefined; }
}
// Authenticated parent owns persistence. Never read a previous user's browser-local demo data.
export const centralStorage = {
  getItem(key: string): string | null { return host()?.getState()[key] ?? null; },
  setItem(key: string, value: string) { if (!host()?.write(key, value)) throw new Error('SPM session unavailable'); },
};
export const centralContext = (): CentralContext => host()?.getContext() ?? { day: 1, origin: 'library', restriction: 'review' };
