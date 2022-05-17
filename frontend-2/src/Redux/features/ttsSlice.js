// Tts means tool-type setting
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tts: [],
  ttsInSelect: [],
  loading: true,
};

const ttsSlice = createSlice({
  name: "tts",
  initialState,
  reducers: {
    setTts: (state, action) => {
      state.tts = action.payload || [];
      state.ttsInSelect = action.payload.map((item) => {
        return { name: item.name, value: item._id };
      });
    },
    addTts: (state, action) => {
      state.ttsInSelect.push({
        name: action.payload.name,
        value: action.payload._id,
      });
      state.tts.push(action.payload)
    },
    updateTts: (state, action) => {
      state.tts = state.tts.map((item) => {
        if (item._id === action.payload._id) {
          item.name = action.payload.name;
        }
        return item;
      });
      state.ttsInSelect = state.ttsInSelect.map((item) => {
        if (item.value === action.payload._id) {
          item.name = action.payload.name;
        }
        return item;
      });
    },
    deleteTts: (state, action) => {
      state.tts = state.tts.filter((item) => item._id !== action.payload);
      state.ttsInSelect = state.ttsInSelect.filter((item) => item.value !== action.payload);
    },
  },
});

// export const getUser = (state) => state.user.user;
export const { setTts, addTts, updateTts, deleteTts } = ttsSlice.actions;
export default ttsSlice.reducer;
