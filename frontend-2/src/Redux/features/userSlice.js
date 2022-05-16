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
      if(state.user.role === "admin") {
        state.users = action.payload;
      } 
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    changeUserStatus: (state, action) => {
      let { uid, role } = action.payload;
      if(uid === state.user._id) {
        state.user.role = role; 
      }

      if(state.user.role === "admin") {
        state.users = state.users.map((user) => {
          if (user._id === uid) {
            user.role = role;
          }
          return user;
        });
      }
    },
    deleteUser: (state, action) => {
      let { uid, active } = action.payload;
      if(uid === state.user._id) {
        state.user.active = active; 
      }

      if(state.user.role === "admin") {
        state.users = state.users.filter((user) => user._id !== uid);
      }
    },
  }
});

export const getUser = (state) => state.user.user;
export const { setUser, setUsers, changeUserStatus, deleteUser } = userSlice.actions;
export default userSlice.reducer;
