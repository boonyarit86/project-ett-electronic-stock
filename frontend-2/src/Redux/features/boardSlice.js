import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [],
  board: null
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
    actionBoard: (state, action) => {
      let { bid, total } = action.payload;
      state.boards = state.boards.map((board) => {
        if (board._id === bid) {
          board.total = total;
        }
        return board;
      });
    },
    getBoard: (state, action) => {
      state.board = state.boards.find((board) => board._id === action.payload);
    },
    resetBoard: (state) => {
      state.board = null;
    },
    addNewBoard: (state, action) => {
      state.boards.push(action.payload);
    },
  }
});

// export const getUser = (state) => state.user.user;
export const { setBoards, actionBoard, getBoard, resetBoard, addNewBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
