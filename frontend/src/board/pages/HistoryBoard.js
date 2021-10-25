import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../shared/context/auth-context";
import { getAllHistoryBoardAction } from "../../actions/boardActions";

// Components
import HistoryTableBoard from "../components/HistoryTableBoard";
import Loading from "../../shared/components/UIElements/Loading";
import { Alert, AlertTitle } from "@material-ui/lab";
import { ToastContainer } from "react-toastify";
import FilterTime from "../../shared/components/UIElements/FilterTime";

function HistoryBoard() {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { isLoading, errorMsg, hisbs, isLoadingActions, errorMsgActions } =
    useSelector((state) => state.hisbLists);
  const [data, setData] = useState([]);

  // Get tools
  useEffect(() => {
    dispatch(getAllHistoryBoardAction(auth.token, setData));
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
      <h1>ประวัติรายการบอร์ด</h1>
      <FilterTime initialData={hisbs} setData={setData} />
      {hisbs && <HistoryTableBoard hisbs={data} auth={auth} dispatch={dispatch} />}
      <ToastContainer />
    </div>
  );
}

export default HistoryBoard;