import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import toolSlice from "../features/toolSlice";
import userSlice from "../features/userSlice";
import boardSlice from "../features/boardSlice";

export const store = configureStore({
    reducer: {
        initialState: stateSlice,
        user: userSlice,
        tool: toolSlice,
        board: boardSlice,
    }
})