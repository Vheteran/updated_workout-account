import { FLOOR_PLAN, applySwaps, getPlanSession } from './floorPlan';
import { getWeekDays, toDateKey } from './week';
import { buildProgram, sessionForWeek } from '../lib/programming';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Spread training days so consecutive hard days are avoided where possible.
const TRAIN_WEEKDAYS = {
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
};

export function trainWeekdays(daysPerWeek) {
  return TRAIN_WEEKDAYS[Math.min(6, Math.max(2, daysPerWeek || 3))] || TRAIN_WEEKDAYS[3];
}

function cycleWeekIndex(planStartedAt, weeks) {
  if (!planStartedAt) return 0;
  const start = new Date(planStartedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const elapsed = Math.max(0, Math.floor((now - start) / 86400000));
  return Math.floor(elapsed / 7) % weeks;
}

function goalTodayPlan(profile) {
  const program = buildProgram(profile);
  const daysPerWeek = program.daysPerWeek;
  const weekIndex = cycleWeekIndex(profile.planStartedAt, program.weeks);
  const week = weekIndex + 1;
  const jsDay = new Date().getDay();
  const trained = trainedDatesThisWeek(profile.history);
  const alreadyToday = trained.has(toDateKey());
  const days = trainWeekdays(daysPerWeek);
  const slot = days.indexOf(jsDay);
  const doneThisWeek = trained.size;
  const base = { program, week, weekIndex, daysPerWeek, doneThisWeek };

  if (alreadyToday) {
    return {
      ...base,
      type: 'done',
      status: `Session logged. Week ${week} of ${program.weeks}: ${program.goal.name.toLowerCase()} block.`,
      session: null,
      moves: [],
    };
  }

  if (slot < 0) {
    return {
      ...base,
      type: 'rest',
      status: `Rest day. Recovery is when the adaptation happens — next session is scheduled, don't add one.`,
      session: null,
      moves: [],
    };
  }

  const session = sessionForWeek(program, weekIndex, slot);
  return {
    ...base,
    type: 'train',
    status: session.deload
      ? `Week ${week} is a planned deload. Lighter loads on purpose so the next block keeps working.`
      : `Week ${week} of ${program.weeks} · ${session.weekLabel} · ${program.splitName}.`,
    session,
    moves: session.moves,
    nextLabel: DAY_NAMES[jsDay],
  };
}

export function planWeekIndex(planStartedAt) {
  if (!planStartedAt) return 0;
  const start = new Date(planStartedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = Math.floor((now - start) / 86400000);
  return Math.min(FLOOR_PLAN.weeks - 1, Math.max(0, Math.floor(days / 7)));
}

function trainedDatesThisWeek(history) {
  const keys = new Set(getWeekDays().map((item) => item.key));
  return new Set((history || []).filter((item) => keys.has(item.date)).map((item) => item.date));
}

export function getTodayPlan(profile) {
  if (profile.goal) return goalTodayPlan(profile);
  const injuries = profile.injuries || [];
  const daysPerWeek = profile.daysPerWeek || FLOOR_PLAN.daysPerWeek;
  const weekIndex = planWeekIndex(profile.planStartedAt);
  const week = weekIndex + 1;
  const today = new Date();
  const jsDay = today.getDay();
  const todayKey = toDateKey(today);
  const trained = trainedDatesThisWeek(profile.history);
  const alreadyToday = trained.has(todayKey);
  const trainDays = FLOOR_PLAN.trainWeekdays.slice(0, daysPerWeek);
  const slot = trainDays.indexOf(jsDay);
  const doneThisWeek = trained.size;
  const expectedByNow = trainDays.filter((day) => day < jsDay).length + (slot >= 0 && alreadyToday ? 1 : 0);
  const missed = trainDays.filter((day) => day < jsDay).length - Math.min(doneThisWeek, trainDays.filter((day) => day < jsDay).length);

  const onTrack = doneThisWeek >= expectedByNow;
  const status = alreadyToday
    ? `On track. You already did today's uFitness session.`
    : onTrack
      ? `On track for week ${week}: ${doneThisWeek} of ${daysPerWeek} sessions.`
      : `Behind by ${Math.max(1, missed)} session. Do only today's work — do not stack two workouts.`;

  if (alreadyToday) {
    return {
      type: 'done',
      week,
      weekIndex,
      daysPerWeek,
      doneThisWeek,
      status,
      session: null,
      moves: [],
    };
  }

  if (slot < 0) {
    return {
      type: 'rest',
      week,
      weekIndex,
      daysPerWeek,
      doneThisWeek,
      status: onTrack
        ? `Rest day. uFitness trains ${FLOOR_PLAN.trainLabels.join(', ')} — no make-up session today.`
        : `Rest day. You missed a training day. Don't double tomorrow; just show up for the next scheduled session.`,
      session: null,
      moves: [],
    };
  }

  const session = getPlanSession(weekIndex, slot);
  const moves = applySwaps(session.moves, injuries);
  return {
    type: 'train',
    week,
    weekIndex,
    daysPerWeek,
    doneThisWeek,
    status,
    session,
    moves,
    nextLabel: DAY_NAMES[jsDay],
  };
}
