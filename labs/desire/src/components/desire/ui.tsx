import type { ReactNode } from 'react';
import { Check, VolumeX } from 'lucide-react';
import trainer from '@/assets/spm-trainer.jpg';
import { videoSlots, type Unit } from '@/lib/desire-data';

export const SIGN = 'Dr. SPM · Salud sexual masculina';
export function Quote({ children }: { children: ReactNode }) {
  return <figure className="dz-quote"><blockquote>{children}</blockquote><figcaption>{SIGN}</figcaption></figure>;
}
export function Cue({ id, children }: { id: string; children: ReactNode }) {
  return <p className="dz-cue" data-audio-id={id}><span>Indicación</span>{children}</p>;
}
export function Trainer({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div className="dz-trainer" data-audio-id={id}>
      <img src={trainer} alt="Entrenador SPM" loading="lazy" />
      <div>
        <span className="dz-eyebrow">Tu entrenador SPM</span>
        <strong>{title}</strong>
        <p>{text}</p>
        <span className="dz-audio-pending"><VolumeX size={14} /> Audio en preparación</span>
      </div>
    </div>
  );
}
export function Slider({ label, value, onChange, low = 'Bajo', high = 'Alto' }: { label: string; value: number; onChange: (v: number) => void; low?: string; high?: string }) {
  return (
    <label className="dz-slider">
      <span className="dz-slider-top"><span>{label}</span><b>{value}<small>/10</small></b></span>
      <input type="range" min={0} max={10} value={value} onChange={(e) => onChange(+e.target.value)} aria-label={label} />
      <span className="dz-slider-ends"><small>{low}</small><small>{high}</small></span>
    </label>
  );
}
export function Chips({ opts, value, onChange, max }: { opts: readonly (readonly [string, string] | readonly [string, string, ...unknown[]])[] | string[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const list = (opts as unknown[]).map((o) => (typeof o === 'string' ? [o, o] : (o as string[])));
  return (
    <div className="dz-chips">
      {list.map(([id = "", label]) => {
        const on = value.includes(id);
        const disabled = !on && !!max && value.length >= max;
        return (
          <button key={id} type="button" aria-pressed={on} disabled={disabled} className={on ? 'on' : ''} onClick={() => onChange(on ? value.filter((x) => x !== id) : [...value, id])}>
            {on && <Check size={14} />}{label}
          </button>
        );
      })}
    </div>
  );
}
export function Seg<T extends string>({ label, value, opts, onChange }: { label: string; value: T; opts: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="dz-seg" role="radiogroup" aria-label={label}>
      <span>{label}</span>
      <div>{opts.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>
    </div>
  );
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`dz-card ${className}`}>{children}</div>;
}
export function VideoSlot({ slot }: { slot: keyof typeof videoSlots }) {
  const v = videoSlots[slot]!;
  if (!v.src) return <span hidden data-video-slot={v.id} data-video-path={v.path} />;
  return <video className="dz-video" controls playsInline src={v.src} data-video-slot={v.id} aria-label={v.title} />;
}
export function Spark({ values, max }: { values: number[]; max: number }) {
  const w = 120, h = 40;
  const pts = values.map((v, i) => `${values.length === 1 ? w / 2 : (i / (values.length - 1)) * (w - 10) + 5},${h - 5 - (Math.min(v, max) / max) * (h - 10)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dz-spark" aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
      {pts.split(' ').map((p, i) => { const [x, y] = p.split(','); return <circle key={i} cx={x} cy={y} r="3" />; })}
    </svg>
  );
}
export const unitOpts: [Unit, string][] = [['week', 'Semana'], ['month', 'Mes'], ['year', 'Año']];
export const triOpts: [string, string][] = [['yes', 'Sí'], ['no', 'No'], ['unsure', 'No seguro']];

