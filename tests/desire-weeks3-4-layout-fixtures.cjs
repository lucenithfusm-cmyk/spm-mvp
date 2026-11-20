// Synthetic parent-frame records for layout QA. No patient account or backend is used.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const screens = [3, 4].flatMap(week => JSON.parse(fs.readFileSync(path.join(root, `premium-v2/desire-week${week}-v1/screens.json`), 'utf8')).map(screen => ({ ...screen, week })));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'premium-v2/desire-week4-v1/catalog.json'), 'utf8'));
const week3Ids = { 15: 'intimacy-ladder', 16: 'sensate-1', 17: 'foreplay-rhythm', 18: 'communicate-limits', 19: 'sensate-2', 20: 'context-design', 21: 'week-review' };

function fixtureFor(screen) {
  const day = screen.day, sid = 'qa-layout-' + screen.id;
  const prior = { id: 'qa-layout-prior-phase1', day: 16, practiceId: 'sensate-1', status: 'completed', comfortable: true, before: 3, after: 5, metricKey: 'desire', completedAt: '2026-11-01T12:00:00Z' };
  const message = {
    type: `SPM_WEEK${screen.week}_INIT`, sid, day,
    record: { id: 'qa-layout-' + screen.id, day, step: Math.max(1, screen.step), status: 'draft', hasStarted: false, route: 'partner', variant: 'solo', confirm: false, fields: {}, choices: {}, na: {} },
    history: [prior], program: { context: '', conditions: [], ranking: [], details: {}, detailNotes: {} },
    safety: { acute: false, review: false, pressure: 3 }
  };
  if (screen.week === 3) {
    message.record.practiceId = week3Ids[day];
    if (screen.id === 'd15_02a') message.safety.pressure = 8;
    if (screen.id === 'd15_02b') message.safety.review = true;
    if (screen.id === 'd18_03a') message.record.route = 'solo';
    if (screen.id === 'd19_00a') message.history = [];
    if (screen.id === 'd21_02a') message.history = [];
  } else {
    const practice = catalog.practices['responsive-window'];
    message.record.practiceId = day === 22 ? practice.id : null;
    message.assignedPractice = practice;
    message.day22Candidates = screen.id === 'd22_02a' ? [] : [practice];
    message.program.continuity = { goals: [], keep: '', space: '' };
    if (screen.id === 'd24_01a') message.history = [];
    if (screen.id === 'd28_02') {
      message.program.baseline = { metrics: { desire: 3 } };
      message.state = { checkins: [{ day: 'D14', date: '2026-11-01T12:00:00Z', metrics: { desire: 4 } }] };
    }
  }
  return message;
}

module.exports = { root, screens, fixtureFor };
