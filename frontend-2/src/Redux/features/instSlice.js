// *** inst => insufficientTool ***
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  insts: [],
};

const instSlice = createSlice({
  name: "insts",
  initialState,
  reducers: {
    setInsts: (state, action) => {
      state.insts = action.payload;
    }
}
});

// export const getTool = (state) => state.user.user;
export const {
  setInsts
} = instSlice.actions;
export default instSlice.reducer;