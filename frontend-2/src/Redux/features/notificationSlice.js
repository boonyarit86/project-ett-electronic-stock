import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadNotifications: 0
};

const notificationSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadNotifications = action.payload.unreadNotifications
    },
    readNotification: (state) => {
      state.unreadNotifications = 0
    },
    addNewNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadNotifications += 1; 
    }
  }
});

export const getNotifications = (state) => state.notification.notifications;
export const { setNotification, readNotification, addNewNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
