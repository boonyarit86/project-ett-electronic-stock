// Tts means tool-category setting
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tcs: [],
  // ttsInSelect: [],
};

const tcsSlice = createSlice({
  name: "tts",
  initialState,
  reducers: {
    setTcs: (state, action) => {
      state.tcs = action.payload;
    },
  },
});

// export const getUser = (state) => state.user.user;
export const { setTcs } = tcsSlice.actions;
export default tcsSlice.reducer;
