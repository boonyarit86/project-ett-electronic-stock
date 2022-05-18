import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import Heading from "../../Components/Text/Heading";
import UserTable from "./Components/UserTable";
import Select from "../../Components/Select/Select";
import Toast from "../../Components/Toast/Toast";
import { AuthContext } from "../../context/auth-context";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { catchError, catchRequestError } from "../../utils/handleError";
import { setUsers } from "../../Redux/features/userSlice";
import "./AuthUser.css";

const statusOptions = [
  { name: "ทั้งหมด", value: 0 },
  { name: "unapprove", value: 1 },
  { name: "user", value: 2 },
  { name: "staff", value: 3 },
];

const AuthUser = () => {
  const auth = useContext(AuthContext);
  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [controller, setController] = useState(null);
  const [userStatus, setUserStatus] = useState(0);
  const [userFilter, setUserFilter] = useState([]);

  const [userTableElement] = useState([
    { minW: "10", maxW: "15", name: "รูปภาพ" },
    { minW: "20", maxW: "25", name: "ชื่อผู้ใช้งาน" },
    { minW: "30", maxW: "35", name: "อีเมล์" },
    { minW: "17", maxW: "23", name: "สถานะ" },
    { minW: "35", maxW: "40", name: "อื่นๆ" },
  ]);

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchUserData() {
        dispatch(startLoading());
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(endLoading());
            dispatch(setUsers(res.data.data.users));
            setUserFilter(res.data.data.users);
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            dispatch(endLoading());
            catchRequestError(error, setRequestError);
          });
      }
      fetchUserData();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  useEffect(() => {
    let data = [...users];
    if (Number(userStatus) === 1) {
      data = data.filter((user) => user.role === "unapprove");
    } else if (Number(userStatus) === 2) {
      data = data.filter((user) => user.role === "user");
    } else if (Number(userStatus) === 3) {
      data = data.filter((user) => user.role === "staff");
    }
    setUserFilter(data);
  }, [userStatus, users]);

  if (isLoading) return <div />;
  if (!isLoading && requestError) {
    return (
      <div className="boardHistory">
        <Toast
          element="error"
          type="default"
          message={requestError}
          className="u-mg-b"
        />
      </div>
    );
  }

  const handleUserStatus = async (status, userId) => {
    let mainElement = document.querySelector(".main");
    let newStatus;
    if (status === "staff" || status === "unapprove") newStatus = "user";
    else if (status === "user") newStatus = "staff";
    else if (status === "non-status") newStatus = "unapprove";

    try {
      dispatch(startLoading());
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/users/setRole/${userId}`,
        { role: newStatus },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        setSuccessMessage("เปลี่ยนสถานะเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    mainElement.scrollTo(0, 0);
  };

  const handleDeleteUser = async (userId) => {
    let mainElement = document.querySelector(".main");

    try {
      dispatch(startLoading());
      await Axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        setSuccessMessage("ลบข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    mainElement.scrollTo(0, 0);
  };

  return (
    <div className="authUser">
      <Heading type="main" text="การจัดการผู้ใช้งาน" className="u-mg-b" />
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
      <Select
        label="สถานะผู้ใช้งาน"
        id="userStatus"
        setState={setUserStatus}
        state={userStatus}
        data={statusOptions}
        className="u-mg-b--small-2"
      />
      <UserTable
        state={userTableElement}
        data={userFilter}
        handleUserStatus={handleUserStatus}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default AuthUser;
