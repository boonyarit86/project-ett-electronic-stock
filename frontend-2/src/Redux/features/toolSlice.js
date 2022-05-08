import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tools: [],
};

const toolsSlice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    setTools: (state, action) => {
      state.tools = action.payload;
    },
  }
});

// export const getUser = (state) => state.user.user;
export const { setTools } = toolsSlice.actions;
export default toolsSlice.reducer;
