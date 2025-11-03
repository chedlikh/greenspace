// src/features/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'blue',
  headerBackground: localStorage.getItem('headerBackground') === 'true', // Boolean
  menuPosition: localStorage.getItem('menuPosition') === 'true', // Boolean
  darkMode: localStorage.getItem('darkMode') === 'true', // Boolean
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setHeaderBackground: (state, action) => {
      state.headerBackground = action.payload;
      localStorage.setItem('headerBackground', action.payload);
    },
    setMenuPosition: (state, action) => {
      state.menuPosition = action.payload;
      localStorage.setItem('menuPosition', action.payload);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
  },
});

export const { setTheme, setHeaderBackground, setMenuPosition, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;