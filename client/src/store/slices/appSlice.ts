// client/src/store/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '@/types/app';

const initialState: AppState = {
  activeSessions: 0,
  currentTime: new Date(),
  isConnected: false,
  theme: 'light',
  locale: 'en',
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
  },
});

export const {
  setActiveSessions,
  setCurrentTime,
  setConnectionStatus,
  toggleTheme,
  setLocale,
} = appSlice.actions;

export default appSlice.reducer;