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
import ToolTable from "./Components/ToolTable";
import Toast from "../../Components/Toast/Toast";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";
import { catchError, catchRequestError } from "../../utils/handleError";
import { AiOutlineTool } from "react-icons/ai";
import { setTts } from "../../Redux/features/ttsSlice";
import { useForm } from "../../hooks/form-hook";
import { VALIDATOR_REQUIRE } from "../../utils/validators";

import "./ToolList.css";


const ToolList = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const tools = useSelector((state) => state.tool.tools);
  const { ttsInSelect } = useSelector((state) => state.tts);
  const [controller, setController] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [toolList, setToolList] = useState([]);
  const [toolFilter, setToolFilter] = useState([]);
  const [toolStatus, setToolStatus] = useState(0);
  const [statusBoxes, setStatusBoxes] = useState([]);
  const [types, setTypes] = useState([]);
  const [toolType, setToolType] = useState(0);
  const [text, setText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("เบิก");
  const [openModal, setOpenModal] = useState(false);
  const [toolSelected, setToolSelected] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [toolTableElement] = useState([
    { minW: "7", maxW: "10", name: "รูปภาพ" },
    { minW: "18", maxW: "27", name: "ชื่ออุปกรณ์" },
    { minW: "10", maxW: "12", name: "สถานะ" },
    { minW: "10", maxW: "12", name: "จำนวน" },
    { minW: "12", maxW: "15", name: "รหัสอุปกรณ์" },
    { minW: "12", maxW: "15", name: "ชนิด" },
    { minW: "12", maxW: "15", name: "ประเภท" },
    { minW: "10", maxW: "12", name: "ขนาด" },
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
    if (tools.length !== 0) {
      let toolOut = tools.filter((item) => item.total === 0);
      let toolRunningOut = tools.filter((item) => item.total <= item.limit);
      let newArr = [
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์",
          total: tools.length,
        },
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์ใกล้หมด",
          total: toolRunningOut.length,
        },
        {
          icon: <AiOutlineTool className="equipment-box__icon icon--large" />,
          text: "จำนวนอุปกรณ์หมด",
          total: toolOut.length,
        },
      ];
      setStatusBoxes(newArr);
      setToolList(tools);
      setToolFilter(tools);
    }
  }, [tools]);

  useEffect(() => {
    let data = [...tools];
    if (!searchResult) {
      if (Number(toolStatus) === 1) {
        data = data.filter(
          (item) => item.total <= item.limit && item.total !== 0
        );
      } else if (Number(toolStatus) === 2) {
        data = data.filter((item) => item.total === 0);
      }

      if (Number(toolType) !== 0) {
        data = data.filter((item) => item.type._id === toolType);
      }
      setToolList(data);
    }
  }, [toolStatus, tools, toolType]);

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchDataTts() {
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tts`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(setTts(res.data.data.tts));
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            catchRequestError(error, setRequestError);
          });
      }
      fetchDataTts();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  useEffect(() => {
    if (ttsInSelect.length > 0) {
      let initialValue = [...ttsInSelect];
      initialValue.unshift({ name: "ทั้งหมด", value: 0 });
      setTypes(initialValue);
    }
  }, [ttsInSelect]);

  const onTextChanged = (e) => {
    setSearchResult(null);
    const value = e.target.value;
    let suggestionList = [];
    if (value.length > 0) {
      // หาข้อมูลโดยใช้ตัวแปร name เช่น props.data[0].name ของข้อมูลด้านบน
      const regex = new RegExp(`^${value}`, "i");
      suggestionList = tools.filter((res) => {
        let keyword = res?.toolName ? res.toolName : res.boardName;
        return regex.test(keyword);
      });
    }

    if (value.length === 0) {
      suggestionList = tools;
    }
    setText(value);
    setSuggestions(suggestionList);
  };

  const onClickItem = (item) => {
    let itemName = item?.toolName ? item.toolName : item.boardName;
    let findData = tools.filter((doc) => doc._id === item._id);
    setToolList(findData);
    setSearchResult(item._id);
    setSuggestions([]);
    setText(itemName);
    setToolType(0);
    setToolStatus(0);
  };

  const onClickReset = () => {
    setText("");
    setSearchResult(null);
    setToolList(tools);
    setToolType(0);
    setToolStatus(0);
  };

  const handleOpenModal = (action, item) => {
    setAction(action);
    setToolSelected(item);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setToolSelected(null);
    setOpenModal(false);
    setDescription("");
  };
  const onSubmitToolAction = async (e) => {
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
        `${process.env.REACT_APP_BACKEND_URL}/tools/action/${toolSelected._id}`,
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

    setToolSelected(null);
    setOpenModal(false);
    setDescription("");
    mainElement.scrollTo(0, 200);
  };

  if (requestError && !isLoading) {
    return (
      <div className="createTool">
        <Toast
          element="error"
          type="default"
          message={requestError}
          style={{ marginBottom: "1rem" }}
        />
      </div>
    );
  }

  return (
    <div className="toolList">
      <Heading type="main" text="รายการอุปกรณ์" className="u-mg-b" />
      <EquipmentStatusBoxs data={statusBoxes} />
      <div className="toolList__filter">
        <Select
          label="สถานะอุปกรณ์"
          id="status"
          setState={setToolStatus}
          state={toolStatus}
          fullWidth
          data={[
            { name: "ทั้งหมด", value: 0 },
            { name: "กำลังหมด", value: 1 },
            { name: "หมด", value: 2 },
          ]}
        />
        {isLoading ? (
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
            label="ชนิดอุปกรณ์"
            id="types"
            setState={setToolType}
            state={toolType}
            fullWidth
            data={types.length > 0 ? types : []}
          />
        )}
        <InputSearch
          label="ค้นหาอุปกรณ์"
          placeholder="ค้นหาโดยใช้ชื่ออุปกรณ์"
          data={tools}
          setSearchResult={setSearchResult}
          className="fullWidth"
          setText={setText}
          text={text}
          setData={setToolList}
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
      <ToolTable
        state={toolTableElement}
        data={toolFilter}
        initialData={toolList}
        setState={setToolFilter}
        handleOpenModal={handleOpenModal}
      />

      {openModal && (
        <React.Fragment>
          <ModalAction
            title={action}
            itemName={`อุปกรณ์ ${toolSelected.toolName}`}
            onClick={handleCloseModal}
          >
            <article className="modal__article">
              <div className="modal__item">
                <p className="modal__text">รหัสอุปกรณ์</p>
                <p className="modal__text">{toolSelected.toolCode}</p>
              </div>
              <div className="modal__item">
                <p className="modal__text">จำนวนในสต๊อก</p>
                <p className="modal__text">{toolSelected.total}</p>
              </div>
            </article>
            <form className="modal__form" onSubmit={onSubmitToolAction}>
              <InputWithValidator
                element="input"
                type="number"
                label="จำนวน"
                id="total"
                placeholder="กรอกจำนวนอุปกรณ์"
                validators={[VALIDATOR_REQUIRE()]}
                onInput={inputHandler}
                errorMessage="กรุณากรอกจำนวนอุปกรณ์"
                required
                fullWidth
              />
              <Input
                element="textarea"
                label="รายละเอียดเพิ่มเติม"
                id="description"
                placeholder="ข้อมูลอื่นๆที่เกี่ยวกับอุปกรณ์"
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

export default ToolList;
