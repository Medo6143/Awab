import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  azanModal: {
    visible: boolean;
    prayerName: string;
  };
}

const initialState: UIState = {
  azanModal: {
    visible: false,
    prayerName: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showAzanModal: (state, action: PayloadAction<string>) => {
      state.azanModal.visible = true;
      state.azanModal.prayerName = action.payload;
    },
    hideAzanModal: (state) => {
      state.azanModal.visible = false;
      state.azanModal.prayerName = '';
    },
  },
});

export const { showAzanModal, hideAzanModal } = uiSlice.actions;
export default uiSlice.reducer;
