/**
 * Central Redux Store Configuration
 * Configures the Redux Toolkit store combining all application slices (Auth, Theme).
 * Exports strongly-typed dispatch and selector hooks for React components.
 */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import themeReducer from './themeSlice';

/**
 * Main application Redux store instance containing all state slices.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

/**
 * RootState type representing the complete state tree structure.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch type representing the store dispatch function with async thunk support.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Custom typed hook for dispatching Redux actions and thunks.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Custom typed hook for selecting slice data from the Redux state tree.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
