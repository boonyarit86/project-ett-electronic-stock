import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllBoardAction } from "../../actions/boardActions";
import { io } from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";

// Components
import TableBoard from "../components/TableBoard";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";
import { TextField } from "@material-ui/core";

// import "./ToolList.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  input: {
    margin: "10px",
  },
}));

function BoardLists() {
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isLoading, errorMsg, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.boardLists);
  const [boards, setBoards] = useState([]);
  const [defaultValue, setDefaultValue] = useState([]);
  const [text, setText] = useState("");

  // Connect with Socket.io
  useEffect(() => {
    // console.log("Client: Socket.io stands by...");
    // const socket = io("ws://localhost:5000");
    const socket = io("https://ett-test.herokuapp.com");
    socket.on("connnection", () => {
      //   console.log("connected to server");
    });

    socket.on("board-actions", (newBoard) => {
      setBoards(newBoard);
      setDefaultValue(newBoard);
    });

    socket.on("disconnect", () => {
      //   console.log("Socket disconnecting");
    });
  }, []);

  // Get boards
  useEffect(() => {
    dispatch(getAllBoardAction(auth.token, setBoards, setDefaultValue));
  }, []);

  // function ค้นหาชื่ออุปกรณ์ในตาราง
  const onTextChanged = (e) => {
    const value = e.target.value;
    let suggestions = [];
    if (value.length > 0) {
      // หาข้อมูลโดยใช้ตัวแปร name เช่น props.data[0].name ของข้อมูลด้านบน
      const regex = new RegExp(`^${value}`, "i");
      suggestions = boards.sort().filter((res) => regex.test(res.boardName));
    }

    // ถ้าไม่ได้พิมพ์อะไรให้กำหนดข้อมูลเป็นค่า default
    if (value.length === 0) {
      suggestions = defaultValue;
    }
    setText(value);
    setBoards(suggestions);
  };

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
      <h1>รายการบอร์ด</h1>
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      {!isLoadingActions && errorMsgActions && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgActions}</AlertTitle>
          </Alert>
        </div>
      )}
      <TextField
        label="ค้นหาชื่อบอร์ด"
        type="text"
        className={classes.input}
        value={text}
        onChange={onTextChanged}
      />
      <TableBoard boards={boards} auth={auth} dispatch={dispatch} />
      <ToastContainer />
    </div>
  );
}

export default BoardLists;
