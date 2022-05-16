import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setNotification, addNewNotification } from "../Redux/features/notificationSlice";
import { actionTool, deleteTool, addNewTool, updateTool } from "../Redux/features/toolSlice";
import { actionBoard, addNewBoard, updateBoard } from "../Redux/features/boardSlice";
import { deleteInst } from "../Redux/features/instSlice";
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
    socket.on("tool-deleting", (data) => {
      dispatch(deleteTool(data.tid));
    });
    socket.on("tool-adding", (data) => {
      dispatch(addNewTool(data));
    });
    socket.on("tool-updating", (data) => {
      dispatch(updateTool(data));
    });
    socket.on("board-action", (data) => {
      dispatch(actionBoard(data));
    });
    socket.on("board-adding", (data) => {
      dispatch(addNewBoard(data));
    });
    socket.on("board-updating", (data) => {
      dispatch(updateBoard(data));
    });
    socket.on("inst-deleting", (data) => {
      dispatch(deleteInst(data.instId));
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
