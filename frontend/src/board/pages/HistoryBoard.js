import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllHistoryBoardAction } from "../../actions/boardActions";
import { makeStyles } from "@material-ui/core/styles";

// Components
import HistoryTableBoard from "../components/HistoryTableBoard";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";
// import SelectFilter from "../components/SelectFilter";
import { TextField } from "@material-ui/core";

// CSS Material UI
const useStyles = makeStyles((theme) => ({
  input: {
    margin: "10px",
  },
}));

function HistoryBoard() {
  const auth = useContext(AuthContext);
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isLoading, errorMsg, hisbs, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.hisbLists);
  const [boards, setBoards] = useState([]);
//   const [defaultValue, setDefaultValue] = useState([]);
//   const [valueFilterType, setValueFilterType] = useState("ทั้งหมด");
//   const [valueFilterStatus, setValueFilterStatus] = useState("ทั้งหมด");
//   const [text, setText] = useState("");

  // Get tools
  useEffect(() => {
    dispatch(getAllHistoryBoardAction(auth.token));
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
      <h1>ประวัติรายการบอร์ด</h1>
      {hisbs && <HistoryTableBoard hisbs={hisbs} auth={auth} dispatch={dispatch} />}
      <ToastContainer />
    </div>
  );
}

export default HistoryBoard;