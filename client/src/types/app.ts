export interface AppState {
  activeSessions: number;
  currentTime: Date;
  isConnected: boolean;
  theme: 'light' | 'dark';
  locale: 'en' | 'uk';
}