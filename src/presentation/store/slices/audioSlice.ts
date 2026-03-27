import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioState } from '../../../domain/entities/types';

const initialState: AudioState = {
  isPlaying: false,
  isBuffering: false,
  currentSurahId: null,
  currentPosition: 0,
  duration: 0,
  playMode: undefined,
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setAudioState: (state, action: PayloadAction<Partial<AudioState>>) => {
      return { ...state, ...action.payload };
    },
    resetAudioState: () => initialState,
  },
});

export const { setAudioState, resetAudioState } = audioSlice.actions;
export default audioSlice.reducer;
