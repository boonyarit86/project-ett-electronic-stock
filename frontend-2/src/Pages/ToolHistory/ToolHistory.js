import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import Axios from "axios";
import Heading from "../../Components/Text/Heading";
import Toast from "../../Components/Toast/Toast";
import { AuthContext } from "../../context/auth-context";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { catchRequestError } from "../../utils/handleError";

import "./ToolHistory.css";
import HistoryTable from "./Components/HistoryTable";

const ToolHistory = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [controller, setController] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [thList, setThList] = useState([]);
  const [thFilter, setThFilter] = useState([]);
  const [toolTableElement] = useState([
    { minW: "10", maxW: "12", name: "เลขที่" },
    { minW: "12", maxW: "14", name: "วันที่" },
    { minW: "18", maxW: "20", name: "ชื่ออุปกรณ์" },
    { minW: "12", maxW: "14", name: "ชื่อผู้ดำเนินการ" },
    { minW: "10", maxW: "12", name: "สถานะ" },
    { minW: "10", maxW: "12", name: "จำนวน" },
    { minW: "10", maxW: "12", name: "เวลา" },
    { minW: "12", maxW: "14", name: "วันหมดอายุ" },
    { minW: "20", maxW: "22", name: "อื่นๆ" },
  ]);

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchData() {
        dispatch(startLoading());
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tools/history`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(endLoading());
            setIsLoading(false);
            setThList(res.data.data.toolHistories);
            setHistoryList(res.data.data.toolHistories);
            setThFilter(res.data.data.toolHistories);
            // console.log(res.data.data.toolHistories)

          })
          .catch((error) => {
            setIsLoading(false);
            dispatch(endLoading());
            catchRequestError(error, setRequestError);
          });
      }
      fetchData();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  if (isLoading) return <div />;
  if (!isLoading && requestError) {
    return (
      <div className="toolHistory">
        <Toast
          element="error"
          type="default"
          message={requestError}
          className="u-mg-b"
        />
      </div>
    );
  }

    console.log(thList);
  return (
    <div className="toolHistory">
      <Heading type="main" text="ประวัติรายการอุปกรณ์" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      {successMessage && (
        <Toast
          element="success"
          type="default"
          message={successMessage}
          className="u-mg-b"
        />
      )}
      <HistoryTable
        state={toolTableElement}
        data={thFilter}
        initialData={thList}
        setState={setThFilter}
        handleOpenModal={() => {}}
      />
    </div>
  );
};

export default ToolHistory;
