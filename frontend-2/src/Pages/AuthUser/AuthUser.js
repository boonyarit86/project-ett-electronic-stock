import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import DescriptionHistory from "../../Components/UIelements/DescriptionHistory";
import Heading from "../../Components/Text/Heading";
// import HistoryTable from "./Components/HistoryTable";
// import ModalTag from "./Components/ModalTag";
// import ModalCancel from "./Components/ModalCancel";
import Select from "../../Components/Select/Select";
import Toast from "../../Components/Toast/Toast";
import { calcDuration } from "../../utils";
import { AuthContext } from "../../context/auth-context";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { catchError, catchRequestError } from "../../utils/handleError";
import {
  setUsers
} from "../../Redux/features/userSlice";
import "./AuthUser.css";
import UserTable from "./Components/UserTable";

const timeOptions = [
  { name: "ทั้งหมด", value: 0 },
  { name: "ภายใน 24 ชั่วโมง", value: 1 },
  { name: "ภายใน 1 อาทิตย์", value: 7 },
  { name: "ภายใน 1 เดือน", value: 30 },
  { name: "ภายใน 3 เดือน", value: 90 },
  { name: "ภายใน 5 เดือน", value: 150 },
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
  const [bhList, setBhList] = useState([]);
  const [userFilter, setUserFilter] = useState([]);
  const [bhFilter, setBhFilter] = useState([]);
  const [openTag, setOpenTag] = useState(false);
  const [tags, setTags] = useState([]);
  const [cuurentTag, setCurrentTag] = useState(0);
  const [initialValue, setInitialValue] = useState(null);
  const [duration, setDuration] = useState(0);
  const [action, setAction] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [dataSelected, setDataSelected] = useState(null);
  const [description, setDescription] = useState("");
  const [boardTableElement] = useState([
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

  const handleOpenTag = (tag, boardName, code) => {
    let obj = {};
    obj.boardName = boardName || "ไม่มีข้อมูล";
    obj.code = code;
    setOpenTag(true);
    setTags(tag);
    setInitialValue(obj);
  };

  const handleCloseTag = () => {
    setOpenTag(false);
    setTags([]);
    setInitialValue(null);
    setCurrentTag(0);
  };

  const handleOpenModal = (action, data) => {
    setAction(action);
    setDataSelected(data);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setAction(null);
    setDataSelected(null);
    setOpenModal(false);
    setDescription("");
  };

  const handleCurrentTag = (value) => {
    let allTags = document.querySelectorAll(".modalHistory__tag");
    let tagElement = document.getElementById(`htag-${value}`);

    allTags.forEach((item) => {
      if (item.getAttribute("class").includes("active")) {
        item.classList.remove("active");
      }
    });
    tagElement.classList.add("active");
    setCurrentTag(value);
  };

  const onSubmitAction = async (e) => {
    let mainElement = document.querySelector(".main");
    let path =
      action === "เบิกบอร์ดพร้อมกับอุปกรณ์" ? "restoreWithTool" : "restore";
    e.preventDefault();

    console.log(
      `${process.env.REACT_APP_BACKEND_URL}/boards/${path}/${dataSelected._id}`
    );
    try {
      dispatch(startLoading());
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/boards/${path}/${dataSelected._id}`,
        { description: description },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        setSuccessMessage("ทำรายการเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
        // dispatch(updateBoardHistory(res.data.data.doc));
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    setAction(null);
    setDataSelected(null);
    setOpenModal(false);
    setDescription("");
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
      {/* <Select
        label="ระยะเวลา"
        id="duration"
        setState={setDuration}
        state={duration}
        data={timeOptions}
      /> */}
      <UserTable
        state={boardTableElement}
        data={userFilter}
        handleOpenModal={handleOpenModal}
        handleOpenTag={handleOpenTag}
      />
      {/* {openTag && (
        <ModalTag
          tags={tags}
          handleOpenTag={handleOpenTag}
          currentTag={cuurentTag}
          handleCurrentTag={handleCurrentTag}
          handleCloseTag={handleCloseTag}
          board={initialValue}
        />
      )}
      {openModal && (
        <ModalCancel
          setDescription={setDescription}
          description={description}
          handleCloseModal={handleCloseModal}
          action={action}
          dataSelected={dataSelected}
          onSubmitAction={onSubmitAction}
        />
      )} */}
    </div>
  );
};

export default AuthUser;
