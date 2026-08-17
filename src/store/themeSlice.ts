/**
 * Redux State Slice: UI & Code Syntax Highlighting Theme Management
 * Manages the global dark/light theme mode and visual code editor syntax themes.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Interface representing the theme state structure.
 */
export interface ThemeState {
  /** Global application visual mode: 'dark' or 'light' */
  theme: 'dark' | 'light';
  /** Active code block / editor syntax highlighting theme */
  codeTheme: string;
}

/** Default theme settings: Dark mode with vs-dark syntax theme */
const initialState: ThemeState = {
  theme: 'dark',
  codeTheme: 'vs-dark',
};

/**
 * Redux slice defining theme reducers and actions.
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Updates the global visual theme mode.
     */
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    /**
     * Updates the code block syntax highlighting theme preference.
     */
    setCodeTheme: (state, action: PayloadAction<string>) => {
      state.codeTheme = action.payload;
    },
  },
});

export const { setTheme, setCodeTheme } = themeSlice.actions;
export default themeSlice.reducer;
