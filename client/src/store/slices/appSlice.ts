// client/src/store/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '@/types/app';

const initialState: AppState = {
  activeSessions: 0,
  currentTime: new Date(),
  isConnected: false,
  theme: 'light',
  locale: 'en',
  sessionHistory: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveSessions: (state, action: PayloadAction<number>) => {
      state.activeSessions = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<Date>) => {
      state.currentTime = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
    // Новые actions для работы с историей сессий
    addSessionHistoryPoint: (state, action: PayloadAction<{ time: string, sessions: number }>) => {
      state.sessionHistory = [...state.sessionHistory, action.payload].slice(-15);
    },
    clearSessionHistory: (state) => {
      state.sessionHistory = [];
    },
  },
});

export const {
  setActiveSessions,
  setCurrentTime,
  setConnectionStatus,
  toggleTheme,
  setLocale,
  addSessionHistoryPoint,
  clearSessionHistory,
} = appSlice.actions;

export default appSlice.reducer;