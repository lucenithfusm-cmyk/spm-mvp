import { useId, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { zoneOpts } from '@/lib/desire-data';

type BodyView = 'front' | 'back';

const anatomicalIds = ['neck', 'chest', 'back', 'abdomen', 'genital', 'glutes', 'thighs'] as const;

type HotspotPoint = { x: number; y: number; side: 'left' | 'right' };

const points: Record<BodyView, Partial<Record<(typeof anatomicalIds)[number], HotspotPoint>>> = {
  front: {
    neck: { x: 120, y: 91, side: 'right' },
    chest: { x: 120, y: 142, side: 'left' },
    abdomen: { x: 120, y: 211, side: 'right' },
    genital: { x: 120, y: 281, side: 'left' },
    thighs: { x: 91, y: 348, side: 'right' },
  },
  back: {
    neck: { x: 120, y: 91, side: 'right' },
    back: { x: 120, y: 164, side: 'left' },
    glutes: { x: 120, y: 287, side: 'right' },
    thighs: { x: 149, y: 348, side: 'left' },
  },
};

function Figure({ view }: { view: BodyView }) {
  const isBack = view === 'back';
  const uid = useId().replace(/:/g, '');
  const skinId = `dz-skin-${uid}`;
  const shortsId = `dz-shorts-${uid}`;
  const shadowId = `dz-shadow-${uid}`;
  return (
    <svg className="dz-body-figure" viewBox="0 0 240 430" role="img" aria-label={`Figura masculina adulta, vista ${isBack ? 'posterior' : 'frontal'}`}>
      <defs>
        <linearGradient id={skinId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--dz-ivory)" stopOpacity=".94" />
          <stop offset=".5" stopColor="var(--dz-ivory)" stopOpacity=".76" />
          <stop offset="1" stopColor="var(--dz-teal)" stopOpacity=".34" />
        </linearGradient>
        <linearGradient id={shortsId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--dz-teal)" stopOpacity=".92" />
          <stop offset="1" stopColor="var(--dz-bg)" />
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="var(--dz-bg)" floodOpacity=".72" />
        </filter>
      </defs>
      <g filter={`url(#${shadowId})`}>
        <ellipse cx="120" cy="45" rx="25" ry="34" fill={`url(#${skinId})`} />
        <path d="M105 74 C106 85 102 92 96 97 L144 97 C138 92 134 85 135 74Z" fill={`url(#${skinId})`} />
        <path d="M96 94 C76 98 66 111 63 135 C60 164 68 196 72 224 C75 244 73 260 70 274 L170 274 C167 260 165 244 168 224 C172 196 180 164 177 135 C174 111 164 98 144 94 C138 104 129 109 120 109 C111 109 102 104 96 94Z" fill={`url(#${skinId})`} />
        <path d="M67 112 C52 121 46 143 42 169 L29 248 C27 261 31 270 40 272 C49 273 54 266 56 254 L72 177Z" fill={`url(#${skinId})`} />
        <path d="M173 112 C188 121 194 143 198 169 L211 248 C213 261 209 270 200 272 C191 273 186 266 184 254 L168 177Z" fill={`url(#${skinId})`} />
        <path d="M70 264 C81 258 96 256 120 256 C144 256 159 258 170 264 L167 307 C152 313 136 313 120 307 C104 313 88 313 73 307Z" fill={`url(#${shortsId})`} />
        <path d="M75 304 C77 333 79 357 80 386 L78 414 C78 423 85 427 96 426 C105 425 108 420 107 413 L111 307Z" fill={`url(#${skinId})`} />
        <path d="M165 304 C163 333 161 357 160 386 L162 414 C162 423 155 427 144 426 C135 425 132 420 133 413 L129 307Z" fill={`url(#${skinId})`} />
        <path d="M78 414 C69 418 66 424 72 427 L99 427 C104 426 106 421 106 414Z" fill={`url(#${skinId})`} />
        <path d="M162 414 C171 418 174 424 168 427 L141 427 C136 426 134 421 134 414Z" fill={`url(#${skinId})`} />
      </g>
      <g className="dz-anatomy-lines">
        <path d={isBack ? 'M88 122 C102 134 138 134 152 122 M120 108 L120 242 M84 175 C101 186 139 186 156 175 M82 276 C99 268 111 270 120 279 C129 270 141 268 158 276' : 'M88 124 C103 115 137 115 152 124 M120 109 L120 151 M95 176 C107 184 133 184 145 176 M99 218 C110 224 130 224 141 218'} />
        <path d="M80 386 C88 390 98 390 106 386 M134 386 C142 390 152 390 160 386" />
      </g>
    </svg>
  );
}

export function BodyMap({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [view, setView] = useState<BodyView>('front');
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((zone) => zone !== id) : [...value, id]);
  const labels = Object.fromEntries(zoneOpts.map(([id, label]) => [id, label]));

  return (
    <div className="dz-bodymap-shell">
      <div className="dz-bodymap-toolbar" role="group" aria-label="Vista del cuerpo">
        <button type="button" className={view === 'front' ? 'on' : ''} aria-pressed={view === 'front'} onClick={() => setView('front')}>Frontal</button>
        <button type="button" className={view === 'back' ? 'on' : ''} aria-pressed={view === 'back'} onClick={() => setView('back')}>Posterior</button>
      </div>
      <div className="dz-bodymap-stage">
        <span className="dz-bodymap-view"><RotateCcw size={13} /> Vista {view === 'front' ? 'frontal' : 'posterior'}</span>
        <div className="dz-bodymap-canvas">
          <Figure view={view} />
          {Object.entries(points[view]).map(([id, point]) => {
            if (!point) return null;
            const on = value.includes(id);
            return (
              <button
                key={`${view}-${id}`}
                type="button"
                className={`dz-hotspot label-${point.side} ${on ? 'on' : ''}`}
                aria-pressed={on}
                aria-label={`${labels[id] ?? id}${on ? ', seleccionado' : ''}`}
                style={{ left: `${(point.x / 240) * 100}%`, top: `${(point.y / 430) * 100}%` }}
                onClick={() => toggle(id)}
              >
                <span className="dz-hotspot-dot">{on && <Check size={12} />}</span>
                <span className="dz-hotspot-label">{labels[id]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="dz-bodymap-hint">Selecciona en la figura o en la lista. Puedes cambiar de vista sin perder tus elecciones.</p>
    </div>
  );
}
