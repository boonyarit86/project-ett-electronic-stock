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
      state.tts = action.payload;
      state.ttsInSelect = action.payload.map((item) => {
        return { name: item.name, value: item._id };
      });
    }
  },
});

// export const getUser = (state) => state.user.user;
export const { setTts } = ttsSlice.actions;
export default ttsSlice.reducer;
