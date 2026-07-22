import { db, auth } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from "firebase/firestore";

export interface ConceptProgress {
  id?: string;
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
  id?: string;
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
  id?: string;
  date: string; // "YYYY-MM-DD"
  problemsSolved: number;
  conceptsCompleted: number;
}

// ─── Progress helpers ──────────────────────────────────────────────────────────

function getUserId() {
  return auth.currentUser?.uid;
}

export async function getConceptProgress(conceptId: string): Promise<ConceptProgress | null> {
  const uid = getUserId();
  if (!uid) return null;

  const docRef = doc(db, `users/${uid}/conceptProgress/${conceptId}`);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as ConceptProgress;
  }
  return null;
}

export async function updateConceptProgress(
  conceptId: string,
  updates: Partial<ConceptProgress>
): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const docRef = doc(db, `users/${uid}/conceptProgress/${conceptId}`);
  const existing = await getDoc(docRef);
  const now = Date.now();

  if (existing.exists()) {
    await updateDoc(docRef, { ...updates, lastAttemptAt: now });
  } else {
    await setDoc(docRef, {
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
  const uid = getUserId();
  if (!uid) return [];

  const colRef = collection(db, `users/${uid}/conceptProgress`);
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as ConceptProgress);
}

export async function getTotalStats(): Promise<{
  conceptsCompleted: number;
  problemsSolved: number;
  currentStreak: number;
  totalXP: number;
}> {
  const allProgress = await getAllProgress();
  const conceptsCompleted = allProgress.filter((p) => p.completed).length;

  const uid = getUserId();
  let problemsSolved = 0;
  if (uid) {
    const attemptsRef = collection(db, `users/${uid}/problemAttempts`);
    const q = query(attemptsRef, where("passed", "==", true));
    const snap = await getDocs(q);
    // Count unique problems solved
    const uniqueProblems = new Set(snap.docs.map(d => d.data().problemId));
    problemsSolved = uniqueProblems.size;
  }

  const streak = await getCurrentStreak();
  const totalXP = conceptsCompleted * 100 + problemsSolved * 20;

  return { conceptsCompleted, problemsSolved, currentStreak: streak, totalXP };
}

// ─── Problem attempt helpers ──────────────────────────────────────────────────

export async function recordProblemAttempt(attempt: Omit<ProblemAttempt, "id">): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const colRef = collection(db, `users/${uid}/problemAttempts`);
  await addDoc(colRef, attempt);

  if (attempt.passed) {
    await recordDailyActivity(1, 0);
  }
}

export async function getProblemAttempts(problemId: string): Promise<ProblemAttempt[]> {
  const uid = getUserId();
  if (!uid) return [];

  const colRef = collection(db, `users/${uid}/problemAttempts`);
  const q = query(colRef, where("problemId", "==", problemId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ProblemAttempt).sort((a, b) => b.attemptedAt - a.attemptedAt);
}

// ─── Streak helpers ────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function recordDailyActivity(problemsSolved: number, conceptsCompleted: number): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const today = todayStr();
  const docRef = doc(db, `users/${uid}/dailyStreaks/${today}`);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data() as DailyStreak;
    await updateDoc(docRef, {
      problemsSolved: (data.problemsSolved || 0) + problemsSolved,
      conceptsCompleted: (data.conceptsCompleted || 0) + conceptsCompleted,
    });
  } else {
    await setDoc(docRef, { date: today, problemsSolved, conceptsCompleted });
  }
}

export async function getCurrentStreak(): Promise<number> {
  const uid = getUserId();
  if (!uid) return 0;

  const colRef = collection(db, `users/${uid}/dailyStreaks`);
  const q = query(colRef, orderBy("date", "desc"));
  const snap = await getDocs(q);
  
  const all = snap.docs.map(d => d.data() as DailyStreak);
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
  const uid = getUserId();
  if (!uid) {
    // Return empty calendar
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    return result;
  }

  const colRef = collection(db, `users/${uid}/dailyStreaks`);
  const snap = await getDocs(colRef);
  const all = snap.docs.map(d => d.data() as DailyStreak);
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
  const uid = getUserId();
  if (!uid) return defaultValue;

  const docRef = doc(db, `users/${uid}/settings/${key}`);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data().value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const uid = getUserId();
  if (!uid) return;

  const docRef = doc(db, `users/${uid}/settings/${key}`);
  await setDoc(docRef, { key, value });
}
