import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tools: [],
  tool: null
};

const toolsSlice = createSlice({
  name: "tools",
  initialState,
  reducers: {
    setTools: (state, action) => {
      state.tools = action.payload;
    },
    actionTool: (state, action) => {
      let { tid, total } = action.payload;
      state.tools.find((tool) => {
        if(tool._id === tid) {
          tool.total = total
        }
        return tool
      })
    },
    getTool: (state, action) => {
      state.tool = state.tools.find((tool) => tool._id === action.payload)
    },
    resetTool: (state) => {
      state.tool = null
    }
  }
});

// export const getTool = (state) => state.user.user;
export const { setTools, actionTool, getTool, resetTool } = toolsSlice.actions;
export default toolsSlice.reducer;
