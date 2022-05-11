import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setNotification, addNewNotification } from "../Redux/features/notificationSlice";
import { actionTool } from "../Redux/features/toolSlice";
import "./Layout.css";

const Layout = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    socket.on("Allnotification-action", (data) => {
      dispatch(setNotification(data));
    });
    socket.on("notification-action", (data) => {
      dispatch(addNewNotification(data));
    });
    socket.on("tool-action", (data) => {
      dispatch(actionTool(data));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="layout">
      {props.children}
    </div>
  );
};

export default Layout;
