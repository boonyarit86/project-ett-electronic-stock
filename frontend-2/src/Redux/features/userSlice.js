import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  }
});

export const getUser = (state) => state.user.user;
export const { setUser, setUsers } = userSlice.actions;
export default userSlice.reducer;
