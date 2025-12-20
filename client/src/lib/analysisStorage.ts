const STORAGE_KEYS = {
  profile: 'swipebetter_profile_analysis_v1',
  reply: 'swipebetter_reply_analysis_v1',
} as const;

const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredAnalysis<T> {
  savedAt: number;
  data: T;
}

export function saveAnalysis<T>(type: 'profile' | 'reply', data: T): void {
  const stored: StoredAnalysis<T> = {
    savedAt: Date.now(),
    data,
  };
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(stored));
}

export function loadAnalysis<T>(type: 'profile' | 'reply'): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[type]);
    if (!raw) return null;

    const stored: StoredAnalysis<T> = JSON.parse(raw);
    const age = Date.now() - stored.savedAt;

    if (age > EXPIRATION_MS) {
      clearAnalysis(type);
      return null;
    }

    return stored.data;
  } catch {
    clearAnalysis(type);
    return null;
  }
}

export function clearAnalysis(type: 'profile' | 'reply'): void {
  localStorage.removeItem(STORAGE_KEYS[type]);
}
