import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [],
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
  }
});

// export const getUser = (state) => state.user.user;
export const { setBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
