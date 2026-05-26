import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isMenuOpen: boolean;
}

const initialState: AppState = {
  isMenuOpen: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    setMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMenuOpen = action.payload;
    },
  },
});

export const { toggleMenu, setMenuOpen } = appSlice.actions;
export default appSlice.reducer;
