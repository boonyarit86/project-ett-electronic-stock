import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import Backdrop from "../../Components/Backdrop/Backdrop";
import Button from "../../Components/Button/Button";
import EquipmentStatusBoxs from "../../Components/EquipmentStatusBox/EquipmentStatusBoxs";
import Heading from "../../Components/Text/Heading";
import Input from "../../Components/Input/Input";
import InputSearch from "../../Components/Input/InputSearch";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import ModalAction from "../../Components/Modal/ModalAction";
import Select from "../../Components/Select/Select";
import Skeleton from "../../Components/Skeleton/Skeleton";
import BoardTable from "./Components/BoardTable";
import Toast from "../../Components/Toast/Toast";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";
import { catchError } from "../../utils/handleError";
import { VscCircuitBoard } from "react-icons/vsc";
import { useForm } from "../../hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../utils/validators";

import "./BoardList.css";


const BoardList = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.board.boards);
  const [boardList, setBoardList] = useState([]);
  const [boardFilter, setBoardFilter] = useState([]);
  const [boardStatus, setBoardStatus] = useState(0);
  const [statusBoxes, setStatusBoxes] = useState([]);
  const [types, setTypes] = useState([]);
  const [boardType, setBoardType] = useState(0);
  const [text, setText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("เบิก");
  const [openModal, setOpenModal] = useState(false);
  const [boardSelected, setBoardSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [boardTableElement] = useState([
    { minW: "7", maxW: "10", name: "รูปภาพ" },
    { minW: "18", maxW: "27", name: "ชื่อบอร์ด" },
    { minW: "15", maxW: "17", name: "สถานะ" },
    { minW: "15", maxW: "17", name: "จำนวน" },
    { minW: "15", maxW: "17", name: "รหัสบอร์ด" },
    { minW: "15", maxW: "17", name: "ชนิด" },
    { minW: "27", maxW: "30", name: "อื่นๆ" },
  ]);

  const [formState, inputHandler] = useForm(
    {
      total: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    let menu = document.querySelectorAll(".sidebar__item");
    let newItemActive = document.getElementById("m5");

    menu.forEach((item) => {
      let isItemActive = item.getAttribute("class").includes("active");
      if (isItemActive) {
        item.classList.remove("active");
      }
    });

    newItemActive.classList.add("active");
  }, []);

  useEffect(() => {
    if (boards?.length !== 0 && boards) {
      let boardOut = boards.filter((item) => item.total === 0);
      let boardRunningOut = boards.filter((item) => item.total <= item.limit);
      let newArr = [
        {
          icon: <VscCircuitBoard className="equipment-box__icon icon--large" />,
          text: "จำนวนบอร์ด",
          total: boards.length,
        },
        {
          icon: <VscCircuitBoard className="equipment-box__icon icon--large" />,
          text: "จำนวนบอร์ดใกล้หมด",
          total: boardRunningOut.length,
        },
        {
          icon: <VscCircuitBoard className="equipment-box__icon icon--large" />,
          text: "จำนวนบอร์ดหมด",
          total: boardOut.length,
        },
      ];
      let typeArr = []
      typeArr.unshift({name: "เลือกทั้งหมด", value: 0})
      boards.forEach((item) => {
        let hasItem = typeArr.find((doc) => doc.name === item.type.toLowerCase());
        if(!hasItem) {
            typeArr.push({name: item.type.toLowerCase(), value: item.type.toLowerCase()})
        }
      });

      setTypes(typeArr);
      setStatusBoxes(newArr);
      setBoardList(boards);
      setBoardFilter(boards);
    }
  }, [boards]);

  useEffect(() => {
    let data = boards ? [...boards] : [];
    if (!searchResult) {
      if (Number(boardStatus) === 1) {
        data = data.filter(
          (item) => item.total <= item.limit && item.total !== 0
        );
      } else if (Number(boardStatus) === 2) {
        data = data.filter((item) => item.total === 0);
      }

      if (Number(boardType) !== 0) {
        data = data.filter((item) => item.type.toLowerCase() === boardType);
      }
      setBoardList(data);
    }
  }, [boardStatus, boards, boardType]);

  const onTextChanged = (e) => {
    setSearchResult(null);
    const value = e.target.value;
    let suggestionList = [];
    if (value.length > 0) {
      // หาข้อมูลโดยใช้ตัวแปร name เช่น props.data[0].name ของข้อมูลด้านบน
      const regex = new RegExp(`^${value}`, "i");
      suggestionList = boards.filter((res) => {
        let keyword = res.boardName;
        return regex.test(keyword);
      });
    }

    if (value.length === 0) {
      suggestionList = boards;
    }
    setText(value);
    setSuggestions(suggestionList);
  };

  const onClickItem = (item) => {
    let itemName = item.boardName;
    let findData = boards.filter((doc) => doc._id === item._id);
    setBoardList(findData);
    setSearchResult(item._id);
    setSuggestions([]);
    setText(itemName);
    setBoardType(0);
    setBoardStatus(0);
  };

  const onClickReset = () => {
    setText("");
    setSearchResult(null);
    setBoardList(boards);
    setBoardType(0);
    setBoardStatus(0);
  };

  const handleOpenModal = (action, item) => {
    setAction(action);
    setBoardSelected(item);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setBoardSelected(null);
    setOpenModal(false);
    setDescription("");
  };
  const onSubmitBoardAction = async (e) => {
    let mainElement = document.querySelector(".main");
    e.preventDefault();
    let data = {
      total: formState.inputs.total.value,
      action: action === "เบิก" ? "request" : "add",
      description,
    };

    try {
      dispatch(startLoading());
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/boards/action/${boardSelected._id}`,
        data,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        setSuccessMessage("ทำรายการเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    setBoardSelected(null);
    setOpenModal(false);
    setDescription("");
    mainElement.scrollTo(0, 200);
  };

  return (
    <div className="toolList">
      <Heading type="main" text="รายการบอร์ด" className="u-mg-b" />
      <EquipmentStatusBoxs data={statusBoxes} />
      <div className="boardList__filter">
        <Select
          label="สถานะบอร์ด"
          id="status"
          setState={setBoardStatus}
          state={boardStatus}
          fullWidth
          data={[
            { name: "ทั้งหมด", value: 0 },
            { name: "กำลังหมด", value: 1 },
            { name: "หมด", value: 2 },
          ]}
        />
        {types.length === 0 ? (
          <div>
            <Skeleton
              element="text"
              size="medium"
              style={{ marginBottom: "0.5rem", height: "2.2rem" }}
            />
            <Skeleton
              element="text"
              className="fullWidth"
              style={{ height: "4rem" }}
            />
          </div>
        ) : (
          <Select
            label="ชนิดบอร์ด"
            id="types"
            setState={setBoardType}
            state={boardType}
            fullWidth
            data={types.length > 0 ? types : []}
          />
        )}
        <InputSearch
          label="ค้นหาบอร์ด"
          placeholder="ค้นหาโดยใช้ชื่อบอร์ด"
          data={boards}
          setSearchResult={setSearchResult}
          className="fullWidth"
          setText={setText}
          text={text}
          setData={setBoardList}
          onClickReset={onClickReset}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          onTextChanged={onTextChanged}
          onClickItem={onClickItem}
        />
      </div>
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          style={{ marginBottom: "1rem" }}
        />
      )}
      {successMessage && (
        <Toast
          element="success"
          type="default"
          message={successMessage}
          style={{ marginBottom: "1rem" }}
        />
      )}
      <BoardTable
        state={boardTableElement}
        data={boardFilter}
        initialData={boardList}
        setState={setBoardFilter}
        handleOpenModal={handleOpenModal}
      />

      {openModal && (
        <React.Fragment>
          <ModalAction
            title={action}
            itemName={`บอร์ด ${boardSelected.boardName}`}
            onClick={handleCloseModal}
          >
            <article className="modal__article">
              <div className="modal__item">
                <p className="modal__text">รหัสบอร์ด</p>
                <p className="modal__text">{boardSelected.boardCode}</p>
              </div>
              <div className="modal__item">
                <p className="modal__text">จำนวนในสต๊อก</p>
                <p className="modal__text">{boardSelected.total}</p>
              </div>
            </article>
            <form className="modal__form" onSubmit={onSubmitBoardAction}>
              <InputWithValidator
                element="input"
                type="number"
                label="จำนวน"
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
              <div className="btn__group justify--left">
                <Button
                  type="button"
                  element="button"
                  className="btn-primary-blue--outline"
                  onClick={handleCloseModal}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  element="button"
                  className="btn-primary-blue"
                  disabled={!formState.isValid}
                >
                  {action}
                </Button>
              </div>
            </form>
          </ModalAction>
          <Backdrop black style={{ zIndex: 100 }} onClick={handleCloseModal} />
        </React.Fragment>
      )}
    </div>
  );
};

export default BoardList;