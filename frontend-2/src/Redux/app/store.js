import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import toolSlice from "../features/toolSlice";
import userSlice from "../features/userSlice";
import boardSlice from "../features/boardSlice";
import ttsSlice from "../features/ttsSlice";
import tcsSlice from "../features/tcsSlice";
import notificationSlice from "../features/notificationSlice";
import toolHistorySlice from "../features/toolHistorySlice";
import instSlice from "../features/instSlice";

export const store = configureStore({
    reducer: {
        initialState: stateSlice,
        user: userSlice,
        tool: toolSlice,
        board: boardSlice,
        tts: ttsSlice,
        tcs: tcsSlice,
        notification: notificationSlice,
        toolHistory: toolHistorySlice,
        inst: instSlice
    }
})