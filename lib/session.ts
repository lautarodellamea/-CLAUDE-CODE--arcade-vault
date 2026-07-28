export interface Session {
  name: string;
}

export const SESSION_STORAGE_KEY = "av_user";

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

export const SCORES_STORAGE_KEY = "av_scores";

export function saveScore(entry: Omit<SavedScore, "at">): void {
  try {
    const all: SavedScore[] = JSON.parse(localStorage.getItem(SCORES_STORAGE_KEY) ?? "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.) — no persiste, la UI sigue funcionando.
  }
}
