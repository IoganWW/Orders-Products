// client/src/types/app.ts
export interface AppState {
  activeSessions: number;
  currentTime: Date;
  isConnected: boolean;
  theme: 'light' | 'dark';
  sessionHistory: Array<{ time: string, sessions: number }>;
}