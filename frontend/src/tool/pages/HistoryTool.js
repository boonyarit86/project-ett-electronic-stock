import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllHistoryToolAction } from "../../actions/toolActions";
import { makeStyles } from "@material-ui/core/styles";

// Components
import HistoryTableTool from "../components/HistoryTableTool";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";
import SelectFilter from "../components/SelectFilter";
import { TextField } from "@material-ui/core";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  input: {
    margin: "10px",
  },
}));

function HistoryTool() {
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isLoading, errorMsg, hists, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.histLists);
  const [tools, setTools] = useState([]);
//   const [defaultValue, setDefaultValue] = useState([]);
//   const [valueFilterType, setValueFilterType] = useState("ทั้งหมด");
//   const [valueFilterStatus, setValueFilterStatus] = useState("ทั้งหมด");
//   const [text, setText] = useState("");

  // Get tools
  useEffect(() => {
    dispatch(getAllHistoryToolAction(auth.token));
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

//   console.log(hists)
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
      <h1>ประวัติรายการอุปกรณ์</h1>
      {hists && <HistoryTableTool hists={hists} auth={auth} dispatch={dispatch} />}
      <ToastContainer />
    </div>
  );
}

export default HistoryTool;