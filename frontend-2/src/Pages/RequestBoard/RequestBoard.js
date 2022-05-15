import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Axios from "axios";
import Backdrop from "../../Components/Backdrop/Backdrop";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Input from "../../Components/Input/Input";
import ModalAction from "../../Components/Modal/ModalAction";
import SelectWithValidator from "../../Components/Select/SelectWithValidator";
import Toast from "../../Components/Toast/Toast";
import ToastToolList from "../../Components/Toast/ToastToolList";
import { AuthContext } from "../../context/auth-context";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import { useForm } from "../../hooks/form-hook";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { catchError } from "../../utils/handleError";
import "./RequestBoard.css";

const RequestBoard = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards } = useSelector((state) => state.board);
  const [errorMessage, setErrorMessage] = useState(null);
  const [description, setDescription] = useState("");
  const [boardList, setBoardList] = useState([]);
  const [toolList, setToolList] = useState([]);
  const [insufficientToolList, setInsufficientToolList] = useState([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isToolEnough, setIsToolEnough] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [formState, inputHandler] = useForm(
    {
      boardId: {
        value: "",
        isValid: false,
      },
    },
    {
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    if (boards.length > 0) {
      let boardArr = [];
      boards.forEach((item) => {
        boardArr.push({ name: item.boardName, value: item._id });
      });
      setBoardList(boardArr);
    }
  }, [boards]);

  useEffect(() => {
    const { boardId, total } = formState.inputs;
    if (boardId.value !== "" || total?.value !== "") {
      setIsCheck(false);
      setInsufficientToolList([]);
      setToolList([]);
    }
  }, [formState.inputs]);

  const onSubmit = async (e) => {
    e.preventDefault();
    let menu = document.querySelectorAll(".sidebar__item");
    let menuId = isToolEnough ? "m5" : "m9";
    let link = isToolEnough ? "/boardList" : "/insTool";
    let newItemActive = document.getElementById(menuId);
    const { boardId, total } = formState.inputs;
    let data = { total: total.value, description: description, tools: [] };

    if (insufficientToolList.length > 0) {
      insufficientToolList.forEach((item) => {
        data.tools.push({ tid: item.tid, total: item.total });
      });
    }

    if (toolList.length > 0) {
      toolList.forEach((item) => {
        data.tools.push({ tid: item.tid, total: item.total });
      });
    }

    try {
      dispatch(startLoading());

      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/boards/request/${boardId.value}`,
        data,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        menu.forEach((item) => {
          let isItemActive = item.getAttribute("class").includes("active");
          if (isItemActive) {
            item.classList.remove("active");
          }
        });
        newItemActive.classList.add("active");
        dispatch(endLoading());
        navigate(link);
      });
    } catch (error) {
      let mainElement = document.querySelector(".main");
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      mainElement.scrollTo(0, 0);
    }

    setIsCheck(false);
    setInsufficientToolList([]);
    setToolList([]);
    setDescription("");
    setOpenModal(false);
  };

  const onClickCheckBoard = async (e) => {
    e.preventDefault();
    const { boardId, total } = formState.inputs;
    try {
      dispatch(startLoading());
      await Axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/boards/check/${boardId.value}/${total.value}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        let insufficientTool = res.data.data.insufficientTool;
        let tools = res.data.data.tools;
        let toolEnough = [];
        let toolNotEnough = [];
        if (insufficientTool === 0) {
          setIsToolEnough(true);
        } else {
          setIsToolEnough(false);
        }
        tools.forEach((item) => {
          if (item.toolCalc >= 0) {
            toolEnough.push(item);
          } else {
            toolNotEnough.push(item);
          }
        });
        setInsufficientToolList(toolNotEnough);
        setToolList(toolEnough);
        setIsCheck(true);
      });
    } catch (error) {
      let mainElement = document.querySelector(".main");
      setIsCheck(false);
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      mainElement.scrollTo(0, 0);
    }
  };

  const handleModal = () => {
    setOpenModal((prev) => !prev);
  };

  return (
    <div className="requestBoard">
      <Heading type="main" text="เบิกบอร์ดและอุปกรณ์" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      <div className="requestBoard__form">
        <SelectWithValidator
          label="ชื่อบอร์ด"
          id="boardId"
          placeholder="เลือกชื่อบอร์ด"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorMessage="กรุณาเลือกชื่อบอร์ด"
          required
          fullWidth
          data={boardList}
        />
        <InputWithValidator
          element="input"
          type="number"
          label="จำนวนบอร์ด"
          id="total"
          placeholder="กรอกจำนวนบอร์ด"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorMessage="กรุณากรอกจำนวนบอร์ด"
          required
          fullWidth
        />
        <Input
          element="textarea"
          label="รายละเอียดเพิ่มเติม"
          id="description"
          placeholder="ข้อมูลอื่นๆที่เกี่ยวกับบอร์ด"
          setState={setDescription}
          state={description}
          fullWidth
        />
        <Button
          type="button"
          element="button"
          className="btn-secondary-purple"
          disabled={!formState.isValid}
          onClick={onClickCheckBoard}
          fullWidth
        >
          ตรวจสอบบอร์ดและอุปกรณ์
        </Button>

        {insufficientToolList.length > 0 && (
          <ToastToolList
            element="error"
            data={insufficientToolList}
            title="รายการอุปกรณ์ที่ไม่ครบ"
          />
        )}
        {toolList.length > 0 && (
          <ToastToolList
            element="success"
            data={toolList}
            title="รายการอุปกรณ์ที่ต้องใช้"
          />
        )}

        <Button
          type="button"
          element="button"
          className="btn-primary-blue"
          disabled={!formState.isValid || !isCheck}
          onClick={isToolEnough ? onSubmit : handleModal}
          fullWidth
        >
          เบิกบอร์ดและอุปกรณ์
        </Button>
      </div>

      {openModal && (
        <React.Fragment>
          <ModalAction onClick={handleModal} title="ต้องการทำการเบิกหรือไม่?">
            <Toast
              element="warning"
              type="light"
              message="มีอุปกรณ์บางรายการไม่เพียงพอแต่ยังสามารถดำเนินการขั้นตอนนี้ได้"
              className="u-mg-b"
            />
            <div className="btn__group justify--left">
              <Button
                type="button"
                element="button"
                className="btn-primary-blue--outline"
                onClick={handleModal}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                element="button"
                className="btn-primary-blue"
                onClick={onSubmit}
              >
                ยืนยัน
              </Button>
            </div>
          </ModalAction>
          <Backdrop black style={{ zIndex: 100 }} onClick={handleModal} />
        </React.Fragment>
      )}
    </div>
  );
};

export default RequestBoard;
