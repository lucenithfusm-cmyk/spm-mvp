import type { DailyActivity } from './central';

export type DailyBreathingVariant = 'recognize' | 'release';
export type DailyBreathingPractice = {
  step: number;
  id: string;
  cycles?: number;
  durationSec?: number;
  showBelly?: boolean;
  lockNoHold?: boolean;
};
export type DailyBreathingJourney = {
  variant: DailyBreathingVariant;
  title: string;
  stages: readonly string[];
  practice: DailyBreathingPractice;
  contextAudioId: string;
  instructionAudioId: 'instruction.daily.4-6' | 'instruction.daily.flexible';
  fullDemonstration: boolean;
  regulationVideo: boolean;
};

// These are presentation routes for existing assignments, not a second calendar.
const variants: Record<string, DailyBreathingVariant> = {
  'breath-learn': 'recognize',
  'breath-two': 'recognize',
  'breath-arousal': 'recognize',
  'breath-consolidate': 'recognize',
  'breath-start': 'release',
  'breath-release': 'release',
  'breath-rescue': 'release',
  'breath-regulate': 'release',
  'breath-autonomy': 'release',
};

function finalPractice(step: number | undefined, day: number): DailyBreathingPractice | null {
  switch (step) {
    case 4: return { step, id: 'core-426', cycles: 5, showBelly: true, lockNoHold: day === 3 };
    case 9: return { step, id: 'pelvic-release', durationSec: 60, showBelly: true };
    case 11: return { step, id: 'session-2', durationSec: 120 };
    case 10: return { step, id: 'rescue', cycles: 3, lockNoHold: true };
    case 8: return { step, id: 'arousal', durationSec: 60 };
    case 7: return { step, id: 'downregulate', durationSec: 60 };
    default: return null;
  }
}

export function isDailyBreathingAssignment(value: unknown): value is DailyActivity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const assignment = value as Partial<DailyActivity>;
  return typeof assignment.id === 'string'
    && typeof assignment.title === 'string' && typeof assignment.summary === 'string'
    && typeof assignment.day === 'number' && Number.isInteger(assignment.day) && assignment.day >= 1 && assignment.day <= 28
    && typeof assignment.minutes === 'number' && Number.isFinite(assignment.minutes) && assignment.minutes >= 0
    && Array.isArray(assignment.steps) && assignment.steps.length > 0
    && assignment.steps.every(step => Number.isInteger(step) && step >= 0 && step < 18);
}

export function getDailyBreathingJourney(assignment: unknown): DailyBreathingJourney | null {
  if (!isDailyBreathingAssignment(assignment) || !Object.prototype.hasOwnProperty.call(variants, assignment.id)) return null;
  const practice = finalPractice(assignment.steps.at(-1), assignment.day);
  if (!practice) return null;
  const variant = variants[assignment.id];
  const contextAudioId = practice.step === 9 ? 'screen.10'
    : practice.step === 8 ? 'screen.09'
      : practice.step === 7 ? 'screen.08'
        : practice.step === 10 ? 'screen.11'
          : 'screen.04';
  return {
    variant,
    title: variant === 'recognize' ? 'Reconoce y respira' : 'Suelta y regula',
    stages: variant === 'recognize'
      ? ['Compara', 'Observa', 'Prepara', 'Practica']
      : ['Suelta', 'Percibe', 'Prepara', 'Practica'],
    practice,
    contextAudioId,
    instructionAudioId: practice.lockNoHold ? 'instruction.daily.4-6' : 'instruction.daily.flexible',
    fullDemonstration: assignment.id === 'breath-learn' && assignment.day === 3,
    regulationVideo: assignment.id === 'breath-regulate',
  };
}
