import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllToolAction } from "../../actions/toolActions";
import { io } from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";

// Components
import TableTool from "../components/TableTool";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";
import SelectFilter from "../components/SelectFilter";
import { TextField } from "@material-ui/core";

// import "./ToolList.css";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  input: {
    margin: "10px",
  },
}));

function ToolLists() {
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isLoading, errorMsg, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.toolLists);
  const [tools, setTools] = useState([]);
  const [defaultValue, setDefaultValue] = useState([]);
  const [valueFilterType, setValueFilterType] = useState("ทั้งหมด");
  const [valueFilterStatus, setValueFilterStatus] = useState("ทั้งหมด");
  const [text, setText] = useState("");

  // Connect with Socket.io
  useEffect(() => {
    // const socket = io("ws://localhost:5000");
    // const socket = io("https://ett-test.herokuapp.com");
    const socket = io(process.env.REACT_APP_SOCKET_URL)

    socket.on("tool-actions", (newTool) => {
      setTools(newTool);
      setDefaultValue(newTool);
    });

    return () =>  socket.disconnect()

  }, []);

  // Get tools
  useEffect(() => {
    dispatch(getAllToolAction(auth.token, setTools, setDefaultValue));
  }, []);

  // function ค้นหาชื่ออุปกรณ์ในตาราง
  const onTextChanged = (e) => {
    const value = e.target.value;
    let suggestions = [];
    if (value.length > 0) {
      // หาข้อมูลโดยใช้ตัวแปร name เช่น props.data[0].name ของข้อมูลด้านบน
      const regex = new RegExp(`^${value}`, "i");
      suggestions = tools.sort().filter((res) => regex.test(res.toolName));
    }

    // ถ้าไม่ได้พิมพ์อะไรให้กำหนดข้อมูลเป็นค่า default
    if (value.length === 0) {
      suggestions = defaultValue;
    }
    setText(value);
    setTools(suggestions);
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
      {isLoadingActions && <Loading loading={isLoadingActions} />}
      {!isLoadingActions && errorMsgActions && (
        <div style={{ margin: "10px" }}>
          <Alert variant="filled" severity="error">
            <AlertTitle>{errorMsgActions}</AlertTitle>
          </Alert>
        </div>
      )}
      <h1>รายการอุปกรณ์</h1>
      <SelectFilter
        label="ชนิด"
        defaultValue={defaultValue}
        data={tools}
        setData={setTools}
        filterType="type"
        setValueFilterType={setValueFilterType}
        valueFilterType={valueFilterType}
        valueFilterStatus={valueFilterStatus}
        setValueFilterStatus={setValueFilterStatus}
      />
      <SelectFilter
        label="สถานะ"
        defaultValue={defaultValue}
        data={tools}
        setData={setTools}
        filterType="status"
        setValueFilterType={setValueFilterType}
        valueFilterType={valueFilterType}
        valueFilterStatus={valueFilterStatus}
        setValueFilterStatus={setValueFilterStatus}
      />
      <TextField
        label="ค้นหาชื่ออุปกรณ์"
        type="text"
        className={classes.input}
        value={text}
        onChange={onTextChanged}
      />
      <TableTool tools={tools} auth={auth} dispatch={dispatch} />
      <ToastContainer />
    </div>
  );
}

export default ToolLists;
