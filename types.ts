
export interface BibleEntry {
  id: string;
  date: string;
  name: string;
  chapel: string;
  village: string;
  scripture: string;
  timestamp: number;
}

export interface AIInsight {
  meditation: string;
  prayer: string;
  verseSuggestion: string;
}

export interface AppState {
  entries: BibleEntry[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}
