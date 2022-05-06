import { configureStore } from "@reduxjs/toolkit";
import stateSlice from "../features/stateSlice";
import userSlice from "../features/userSlice";

export const store = configureStore({
    reducer: {
        initialState: stateSlice,
        user: userSlice
    }
})