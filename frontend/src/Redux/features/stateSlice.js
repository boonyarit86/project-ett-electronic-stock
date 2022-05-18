import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loading: false
};

const stateSlice = createSlice({
    name: "state",
    initialState,
    reducers: {
        startLoading: (state) => {
            state.loading = true;
        },
        endLoading: (state) => {
            state.loading = false;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        }
    }
})

export const { startLoading, endLoading, setToken } = stateSlice.actions;
export default stateSlice.reducer;