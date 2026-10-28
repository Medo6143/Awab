import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  azanModal: {
    visible: boolean;
    prayerName: string;
  };
  /** The id of the reminder whose alarm screen is showing. */
  ringingReminder: string | null;
}

const initialState: UIState = {
  azanModal: {
    visible: false,
    prayerName: '',
  },
  ringingReminder: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showAzanModal: (state, action: PayloadAction<string>) => {
      state.azanModal.visible = true;
      state.azanModal.prayerName = action.payload;
    },
    showReminderAlarm: (state, action: PayloadAction<string>) => {
      state.ringingReminder = action.payload;
    },
    hideReminderAlarm: (state) => {
      state.ringingReminder = null;
    },
    hideAzanModal: (state) => {
      state.azanModal.visible = false;
      state.azanModal.prayerName = '';
    },
  },
});

export const { showAzanModal, hideAzanModal, showReminderAlarm, hideReminderAlarm } = uiSlice.actions;
export default uiSlice.reducer;
