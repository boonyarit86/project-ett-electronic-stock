import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tools: [],
  tool: null,
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
      state.tools = state.tools.map((tool) => {
        if (tool._id === tid) {
          tool.total = total;
        }
        return tool;
      });
    },
    getTool: (state, action) => {
      state.tool = state.tools.find((tool) => tool._id === action.payload);
    },
    resetTool: (state) => {
      state.tool = null;
    },
    deleteTool: (state, action) => {
      state.tools = state.tools.filter((tool) => tool._id !== action.payload);
    },
    addNewTool: (state, action) => {
      state.tools.push(action.payload);
    },
    updateTool: (state, action) => {
      state.tools = state.tools.map((tool) => {
        if (tool._id === action.payload._id) {
          tool = action.payload;
        }
        return tool;
      });
    },
  },
});

// export const getTool = (state) => state.user.user;
export const {
  setTools,
  actionTool,
  getTool,
  resetTool,
  deleteTool,
  addNewTool,
  updateTool,
} = toolsSlice.actions;
export default toolsSlice.reducer;
