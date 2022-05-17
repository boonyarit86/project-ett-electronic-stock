// Tts means tool-category setting
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tcs: [],
  tcsInSelect: []
};

const tcsSlice = createSlice({
  name: "tts",
  initialState,
  reducers: {
    setTcs: (state, action) => {
      state.tcs = action.payload;
    },
    setTcsInSelect: (state, action) => {
      let ttsId = action.payload;
      let tcsFilter = [];
      state.tcs.forEach((item) => {
        if(item.tts === ttsId) {
          tcsFilter.push({ name: item.name, value: item._id });
        }
      });
      state.tcsInSelect = tcsFilter;
    },
    addTcs: (state, action) => {
      state.tcsInSelect.push({
        name: action.payload.name,
        value: action.payload._id,
      });
      state.tcs.push(action.payload)
    },
    updateTcs: (state, action) => {
      state.tcs = state.tcs.map((item) => {
        if (item._id === action.payload._id) {
          item.name = action.payload.name;
        }
        return item;
      });
      state.tcsInSelect = state.tcsInSelect.map((item) => {
        if (item.value === action.payload._id) {
          item.name = action.payload.name;
        }
        return item;
      });
    },
    deleteTcs: (state, action) => {
      state.tcs = state.tcs.filter((item) => item._id !== action.payload);
      state.tcsInSelect = state.tcsInSelect.filter((item) => item.value !== action.payload);
    },
  },
});

// export const getUser = (state) => state.user.user;
export const { setTcs, setTcsInSelect, addTcs, updateTcs, deleteTcs } = tcsSlice.actions;
export default tcsSlice.reducer;
