import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllToolAction } from "../../actions/toolActions";
import { io } from "socket.io-client";

// Components
import TableTool from "../components/TableTool";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";


// import "./ToolList.css";

function ToolLists() {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { isLoading, errorMsg, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.toolLists);
  const [tools, setTools] = useState([]);

  // Connect with Socket.io
  useEffect(() => {
    // console.log("Client: Socket.io stands by...");
    const socket = io("ws://localhost:5000");
    // const socket = io(`${process.env.REACT_APP_BACKEND_URL}`);
    socket.on("connnection", () => {
      //   console.log("connected to server");
    });

    socket.on("tool-actions", (newTool) => {
      //   console.log("Client: tool-added");
      setTools(newTool);
    });

    socket.on("disconnect", () => {
      //   console.log("Socket disconnecting");
    });
  }, []);

  // Get tools
  useEffect(() => {
    dispatch(getAllToolAction(auth.token, setTools));
  }, []);

  if (isLoading) {
    return <Loading loading={isLoading} />;
  }

  if (!isLoading && errorMsg) {
    return (
      <div style={{ margin: "10px" }}>
        <Alert variant="filled" severity="error">
          <AlertTitle>{errorMsg}</AlertTitle>
        </Alert>
      </div>
    );
  }
  return (
    <div className="container-toollist">
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      {!isLoadingActions && errorMsgActions && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgActions}</AlertTitle>
          </Alert>
        </div>
      )}
      <h1>รายการอุปกรณ์</h1>
      <TableTool tools={tools} auth={auth} dispatch={dispatch} />
      <ToastContainer />
    </div>
  );
}

export default ToolLists;
