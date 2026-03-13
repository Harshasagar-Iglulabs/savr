import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type SnackbarType = 'error' | 'info' | 'success';

type UiState = {
  snackbar: {
    visible: boolean;
    message: string;
    type: SnackbarType;
  };
};

const initialState: UiState = {
  snackbar: {
    visible: false,
    message: '',
    type: 'info',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showGlobalSnackbar(
      state,
      action: PayloadAction<{message: string; type?: SnackbarType}>,
    ) {
      state.snackbar.visible = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.type = action.payload.type ?? 'info';
    },
    hideGlobalSnackbar(state) {
      state.snackbar.visible = false;
    },
  },
});

export const {showGlobalSnackbar, hideGlobalSnackbar} = uiSlice.actions;

export default uiSlice.reducer;
