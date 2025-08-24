import { store } from '@/store';

// Типы для Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типы для AsyncThunk
export interface ThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}

// Базовый интерфейс для slice состояния
export interface BaseSliceState {
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Типы для действий Redux
export interface PayloadAction<T> {
  type: string;
  payload: T;
}

export interface Action {
  type: string;
}