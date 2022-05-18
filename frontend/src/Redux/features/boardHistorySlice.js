import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boardHistories: [],
};

const boardHistorySlice = createSlice({
  name: "boardHistory",
  initialState,
  reducers: {
    setBoardHistory: (state, action) => {
      state.boardHistories = action.payload;
    },
    updateBoardHistory: (state, action) => {
      state.boardHistories = state.boardHistories.map((doc) => {
        if(doc._id === action.payload._id) {
          doc = action.payload
        }
        return doc
      })
    },
  }
});

// export const getUser = (state) => state.user.user;
export const { setBoardHistory, updateBoardHistory } = boardHistorySlice.actions;
export default boardHistorySlice.reducer;