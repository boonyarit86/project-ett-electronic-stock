import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toolHistories: [],
};

const toolHistorySlice = createSlice({
  name: "toolHistory",
  initialState,
  reducers: {
    setToolHistory: (state, action) => {
      state.toolHistories = action.payload;
    },
    updateToolHistory: (state, action) => {
      state.toolHistories = state.toolHistories.map((doc) => {
        if(doc._id === action.payload._id) {
          doc = action.payload
        }
        return doc
      })
    },
  }
});

// export const getUser = (state) => state.user.user;
export const { setToolHistory, updateToolHistory } = toolHistorySlice.actions;
export default toolHistorySlice.reducer;
