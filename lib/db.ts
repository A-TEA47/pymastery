// lib/db.ts
// IndexedDB persistence via Dexie.js

import Dexie, { Table } from "dexie";

export interface ConceptProgress {
  id?: number;
  conceptId: string;
  completed: boolean;
  warmupPassed: boolean;
  appliedPassed: boolean;
  challengePassed: boolean;
  hintsUsed: number;
  solutionViewed: boolean;
  masteryScore: number; // 0-100
  completedAt?: number;
  lastAttemptAt: number;
}

export interface ProblemAttempt {
  id?: number;
  problemId: string;
  conceptId: string;
  passed: boolean;
  code: string;
  hintsUsed: number;
  solutionViewed: boolean;
  attemptedAt: number;
  timeTakenSeconds?: number;
}

export interface DailyStreak {
  id?: number;
  date: string; // "YYYY-MM-DD"
  problemsSolved: number;
  conceptsCompleted: number;
}

export interface UserSettings {
  id?: number;
  key: string;
  value: string;
}

class PyMasteryDB extends Dexie {
  conceptProgress!: Table<ConceptProgress>;
  problemAttempts!: Table<ProblemAttempt>;
  dailyStreaks!: Table<DailyStreak>;
  userSettings!: Table<UserSettings>;

  constructor() {
    super("PyMasteryDB");
    this.version(1).stores({
      conceptProgress: "++id, conceptId, completed, masteryScore",
      problemAttempts: "++id, problemId, conceptId, passed, attemptedAt",
      dailyStreaks: "++id, date",
      userSettings: "++id, key",
    });
  }
}

export const db = new PyMasteryDB();

// ─── Progress helpers ──────────────────────────────────────────────────────────

export async function getConceptProgress(conceptId: string): Promise<ConceptProgress | null> {
  const row = await db.conceptProgress.where("conceptId").equals(conceptId).first();
  return row || null;
}

export async function updateConceptProgress(
  conceptId: string,
  updates: Partial<ConceptProgress>
): Promise<void> {
  const existing = await getConceptProgress(conceptId);
  const now = Date.now();

  if (existing?.id) {
    await db.conceptProgress.update(existing.id, { ...updates, lastAttemptAt: now });
  } else {
    await db.conceptProgress.add({
      conceptId,
      completed: false,
      warmupPassed: false,
      appliedPassed: false,
      challengePassed: false,
      hintsUsed: 0,
      solutionViewed: false,
      masteryScore: 0,
      lastAttemptAt: now,
      ...updates,
    });
  }
}

export async function markConceptComplete(conceptId: string): Promise<void> {
  await updateConceptProgress(conceptId, {
    completed: true,
    completedAt: Date.now(),
  });
  await recordDailyActivity(0, 1);
}

export async function getAllProgress(): Promise<ConceptProgress[]> {
  return db.conceptProgress.toArray();
}

export async function getTotalStats(): Promise<{
  conceptsCompleted: number;
  problemsSolved: number;
  currentStreak: number;
  totalXP: number;
}> {
  const allProgress = await getAllProgress();
  const conceptsCompleted = allProgress.filter((p) => p.completed).length;

  const allAttempts = await db.problemAttempts.toArray();
  const problemsSolved = allAttempts.filter((a) => a.passed).length;

  const streak = await getCurrentStreak();
  const totalXP = conceptsCompleted * 100 + problemsSolved * 20;

  return { conceptsCompleted, problemsSolved, currentStreak: streak, totalXP };
}

// ─── Problem attempt helpers ──────────────────────────────────────────────────

export async function recordProblemAttempt(attempt: Omit<ProblemAttempt, "id">): Promise<void> {
  await db.problemAttempts.add(attempt);
  if (attempt.passed) {
    await recordDailyActivity(1, 0);
  }
}

export async function getProblemAttempts(problemId: string): Promise<ProblemAttempt[]> {
  return db.problemAttempts.where("problemId").equals(problemId).toArray();
}

// ─── Streak helpers ────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordDailyActivity(problemsSolved: number, conceptsCompleted: number): Promise<void> {
  const today = todayStr();
  const existing = await db.dailyStreaks.where("date").equals(today).first();

  if (existing?.id) {
    await db.dailyStreaks.update(existing.id, {
      problemsSolved: (existing.problemsSolved || 0) + problemsSolved,
      conceptsCompleted: (existing.conceptsCompleted || 0) + conceptsCompleted,
    });
  } else {
    await db.dailyStreaks.add({ date: today, problemsSolved, conceptsCompleted });
  }
}

export async function getCurrentStreak(): Promise<number> {
  const all = await db.dailyStreaks.orderBy("date").reverse().toArray();
  if (all.length === 0) return 0;

  let streak = 0;
  const today = todayStr();
  let checkDate = today;

  for (const entry of all) {
    if (entry.date === checkDate && (entry.problemsSolved > 0 || entry.conceptsCompleted > 0)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().slice(0, 10);
    } else if (entry.date < checkDate) {
      break;
    }
  }

  return streak;
}

export async function getStreakCalendar(days: number = 90): Promise<{ date: string; count: number }[]> {
  const all = await db.dailyStreaks.toArray();
  const map = new Map(all.map((s) => [s.date, s.problemsSolved + s.conceptsCompleted]));

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, count: map.get(dateStr) || 0 });
  }
  return result;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  const row = await db.userSettings.where("key").equals(key).first();
  return row ? row.value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.userSettings.where("key").equals(key).first();
  if (existing?.id) {
    await db.userSettings.update(existing.id, { value });
  } else {
    await db.userSettings.add({ key, value });
  }
}
