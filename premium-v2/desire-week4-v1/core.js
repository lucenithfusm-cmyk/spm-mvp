/* Pure data rules for the tactile Desire week 4. Shared by the viewer and its tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SPM_WEEK4_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const DAYS = [22, 23, 24, 25, 26, 27, 28];
  const IDS = {22: null, 23: 'flex-script', 24: 'desire-curve', 25: 'if-then', 26: 'continuity-goals', 27: 'autonomous-rehearsal', 28: 'final-compare'};
  const EXTRA = ['desire', 'curiosity', 'openness', 'enjoyment', 'pressure', 'connection'];
  const fresh = day => ({id: `w4-${day}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`, day, practiceId: IDS[day], status: 'draft', step: 1, before: null, after: null, localAfter: null, extra: Object.fromEntries(EXTRA.map(k => [k, null])), fields: {}, choices: {}, na: {}, confirm: false, variant: 'solo', partnerConsent: false, ready: false, comfort: null, comfortable: null, comfortableAnswered: false, elapsed: 0, running: false, lastTick: 0, hasStarted: false, runnerStep: 0, runnerCompleted: false, reflectionSource: 'auto', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null});
  function composeReflection(record) {
    const f = record.fields || {};
    if (record.reflectionSource === 'manual') return String(f.reflection || '');
    if (record.day === 23) return [[f.demand_phrase, 'Exigencia'], [f.flexible_phrase, 'Opción']].filter(([v]) => String(v || '').trim()).map(([v,l]) => `${l}: ${v}`).join('\n');
    if (record.day === 25) return [[f.if_tired, 'Cansancio'], [f.if_pressure, 'Presión'], [f.if_low_interest, 'Interés']].filter(([v]) => String(v || '').trim()).map(([v,l]) => `${l}: ${v}`).join('\n');
    if (record.day === 27) {
      const v = {touch:'Contacto', image:'Imagen', sound:'Sonido', memory:'Recuerdo'}[record.choices?.known_stimulus];
      return [[v,'Estímulo'],[f.supporting_condition,'Condición']].filter(([x])=>String(x||'').trim()).map(([x,l])=>`${l}: ${x}`).join('\n');
    }
    return String(f.reflection || '');
  }
  function recordFrom(day, value) {
    const raw = value && typeof value === 'object' ? value : {};
    const out = {...fresh(day), ...raw, day, running: false, lastTick: 0, step: Math.max(1, Math.min(4, Number(raw.step) || 1)), fields: {...raw.fields}, choices: {...raw.choices}, na: {...raw.na}, extra: Object.fromEntries(EXTRA.map(k => [k, validNumber(raw.extra?.[k], 10)]))};
    if (day !== 22) out.practiceId = IDS[day];
    if (out.practiceId === '@best') out.practiceId = null;
    for (const k of ['before','after','localAfter','comfort']) out[k] = raw[k] === null || raw[k] === undefined ? null : raw[k];
    if (day === 24) out.before = out.after = out.localAfter = null;
    if ([25,26,28].includes(day)) out.before = out.after = null;
    out.elapsed = Math.max(0, Number(raw.elapsed) || 0);
    out.confirm = raw.confirm === true;
    return out;
  }
  function validNumber(value, max = 10) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max ? Math.round(value) : null; }
  const metricKey = id => id.replace(/^metric-/, '').replace(/-(?:scale|na)$/, '').replace(/^local_after$/, 'localAfter');
  const metricValue = (s, key) => key.startsWith('extra.') ? s.extra?.[key.slice(6)] ?? null : s[key] ?? null;
  function setMetric(s, key, value, max = 10) { const v = validNumber(value, max); if (key.startsWith('extra.')) s.extra[key.slice(6)] = v; else s[key] = v; return v; }
  function sessionRows(archive, session) { return [...new Map([...archive, ...Object.values(session).filter(x => x.hasStarted || x.status === 'completed')].filter(x=>x && x.practiceId && x.practiceId !== '@best').map(x => [x.id, x])).values()]; }
  function bestIds(rows, catalog, eligible) {
    const sums = new Map();
    for (const s of rows) {
      const p = catalog[s.practiceId];
      if (!p || p.reflective || s.status !== 'completed' || ['pressure','local'].includes(s.metricKey || p.metric) || typeof s.before !== 'number' || typeof s.after !== 'number') continue;
      const value = sums.get(p.id) || {total:0,n:0}; value.total += s.after - s.before; value.n++; sums.set(p.id,value);
    }
    // The approved engine chooses the two historic bests before checking today's
    // eligibility. It never fills a blocked slot with a third historic result.
    return [...sums].filter(([,v])=>v.total/v.n>0).sort((a,b)=>b[1].total/b[1].n-a[1].total/a[1].n).slice(0,2).map(([id])=>id).filter(id=>eligible(catalog[id]));
  }
  function reflectionError(record) { return composeReflection(record).length > 400 ? 'Tu reflexión supera los 400 caracteres. Revísala antes de guardar.' : ''; }
  function hitGeometry(control, controls, viewportWidth = 390) {
    const n=control.normalized,width=Math.min(viewportWidth,490),height=width*1920/1080;
    let top=Math.max(0,(44/height-n.height)/2),bottom=top,left=Math.max(0,(44/width-n.width)/2),right=left;
    // Every disjoint pair retains a separating midpoint on at least one axis.
    // This also prevents diagonally adjacent controls from sharing a corner.
    for(const other of controls){if(other===control)continue;const b=other.normalized;
      if(b.y>=n.y+n.height)bottom=Math.min(bottom,(b.y-n.y-n.height)/2);
      if(b.y+b.height<=n.y)top=Math.min(top,(n.y-b.y-b.height)/2);
      if(b.x>=n.x+n.width)right=Math.min(right,(b.x-n.x-n.width)/2);
      if(b.x+b.width<=n.x)left=Math.min(left,(n.x-b.x-b.width)/2);
    }
    top=Math.min(top,n.y);left=Math.min(left,n.x);bottom=Math.min(bottom,1-n.y-n.height);right=Math.min(right,1-n.x-n.width);
    return {top,bottom,left,right,rect:{x:n.x-left,y:n.y-top,width:n.width+left+right,height:n.height+top+bottom}};
  }
  return {DAYS, IDS, EXTRA, fresh, recordFrom, composeReflection, validNumber, metricKey, metricValue, setMetric, sessionRows, bestIds, reflectionError, hitGeometry};
});
