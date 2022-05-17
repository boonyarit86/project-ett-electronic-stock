import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import Input from "../../Components/Input/Input";
import Select from "../../Components/Select/Select";
import Toast from "../../Components/Toast/Toast";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { AuthContext } from "../../context/auth-context";
import { catchError, catchRequestError } from "../../utils/handleError";
import {
  setTts,
  addTts,
  updateTts,
  deleteTts,
} from "../../Redux/features/ttsSlice";
import {
  setTcs,
  setTcsInSelect,
  addTcs,
  updateTcs,
  deleteTcs,
} from "../../Redux/features/tcsSlice";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

import "./SettingTool.css";

const SettingTool = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { ttsInSelect } = useSelector((state) => state.tts);
  const { tcsInSelect } = useSelector((state) => state.tcs);
  const [controller, setController] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toolType, setToolType] = useState(0);
  const [newToolType, setNewToolType] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("");
  const [editToolType, setEditToolType] = useState("");
  const [editToolCategory, setEditToolCategory] = useState("");
  const [toolCategory, setToolCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      async function fetchDataTcs() {
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tcs`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(setTcs(res.data.data.tcs));
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            catchRequestError(error, setRequestError);
          });
      }

      fetchDataTts();
      fetchDataTcs();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  useEffect(() => {
    if (ttsInSelect.length > 0) {
      let initialValue = [...ttsInSelect];
      initialValue.unshift({ name: "", value: 0 });
      setTypes(initialValue);
    }
  }, [ttsInSelect]);

  // Work, when select a value from "Type" select
  useEffect(() => {
    if (tcsInSelect) {
      setCategories(tcsInSelect);
      setToolCategory(null);
      setEditToolCategory("");
    }
  }, [tcsInSelect]);

  // Work, when select a value from "Type" select
  useEffect(() => {
    if (Number(toolType) !== 0) {
      let findTts = ttsInSelect.find((item) => item.value === toolType);
      setEditToolType(findTts.name);
      dispatch(setTcsInSelect(toolType));
    } else {
      setCategories([]);
    }
  }, [toolType]);

  const onClickAddNewValue = async (action) => {
    let newValue =
      action === "tts"
        ? { name: newToolType }
        : { name: newToolCategory, tts: toolType };
    let mainElement = document.querySelector(".main");

    try {
      dispatch(startLoading());
      await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/${action}/`,
        newValue,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        if (action === "tts") {
          dispatch(addTts(res.data.data.tts));
        } else {
          dispatch(addTcs(res.data.data.tcs));
        }
        setSuccessMessage("เพิ่มข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    setNewToolType("");
    setNewToolCategory("");
    mainElement.scrollTo(0, 0);
  };

  const onClickEditValue = async (action) => {
    let newValue = action === "tts" ? editToolType : editToolCategory;
    let path_id = action === "tts" ? toolType : toolCategory;
    let mainElement = document.querySelector(".main");

    try {
      dispatch(startLoading());
      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/${action}/${path_id}`,
        { name: newValue },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        if (action === "tts") {
          dispatch(updateTts(res.data.data.tts));
        } else {
          dispatch(updateTcs(res.data.data.tcs));
        }
        setSuccessMessage("แก้ไขข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    setToolCategory(null);
    setEditToolCategory("");
    mainElement.scrollTo(0, 0);
  };

  const onClickDeleteValue = async (action, tcsId) => {
    let path_id = action === "tts" ? toolType : tcsId;
    let mainElement = document.querySelector(".main");

    try {
      dispatch(startLoading());
      await Axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/${action}/${path_id}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        if (action === "tts") {
          dispatch(deleteTts(toolType));
          setToolType(0);
        } else {
          dispatch(deleteTcs(tcsId));
        }
        setSuccessMessage("ลบข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => setSuccessMessage(null), 10000);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
    }

    setToolCategory(null);
    setEditToolCategory("");
    mainElement.scrollTo(0, 0);
  };

  const onClickOpenEditCategoryInput = (id, name) => {
    setToolCategory(id);
    setEditToolCategory(name);
  };
  const onClickCloseEditCategoryInput = () => {
    setToolCategory(null);
    setEditToolCategory("");
  };

  if (requestError && !isLoading) {
    return (
      <div className="createTool">
        <Toast
          element="error"
          type="default"
          message={requestError}
          className="u-mg-b--sm-2"
        />
      </div>
    );
  }

  return (
    <div className="settingTool">
      <Heading
        type="main"
        text="การกำหนดค่าชนิด/ประเภทอุปกรณ์"
        className="u-mg-b"
      />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b--sm-2"
        />
      )}
      {successMessage && (
        <Toast
          element="success"
          type="default"
          message={successMessage}
          className="u-mg-b--sm-2"
        />
      )}

      <div className="settingTool__form">
        <div className="settingTool__input">
          <Input
            element="input"
            type="text"
            label="ชนิดอุปกรณ์"
            id="toolType"
            placeholder=""
            setState={setNewToolType}
            state={newToolType}
            fullWidth
          />
          <Button
            element="button"
            type="button"
            className="btn btn-primary-blue btn--small-2"
            onClick={() => onClickAddNewValue("tts")}
          >
            เพิ่ม
          </Button>
        </div>
      </div>

      <div className="settingTool__form">
        <Select
          label="รายการชนิดอุปกรณ์"
          id="types"
          setState={setToolType}
          state={toolType}
          fullWidth
          data={types}
        />

        {Number(toolType) !== 0 && (
          <div className="settingTool__input">
            <Input
              element="input"
              type="text"
              label=""
              id="editToolType"
              placeholder=""
              setState={setEditToolType}
              state={editToolType}
              fullWidth
            />
            <Button
              element="button"
              type="button"
              className="btn btn-primary-blue btn--small-2"
              onClick={() => onClickEditValue("tts")}
            >
              แก้ไข
            </Button>
            <Button
              element="button"
              type="button"
              className="btn btn-secondary-red btn--small-2"
              onClick={() => onClickDeleteValue("tts", null)}
            >
              ลบ
            </Button>
          </div>
        )}
      </div>

      {Number(toolType) !== 0 && (
        <div className="settingTool__form">
          <div className="settingTool__input">
            <Input
              element="input"
              type="text"
              label="ประเภทอุปกรณ์"
              id="toolCategory"
              placeholder=""
              setState={setNewToolCategory}
              state={newToolCategory}
              fullWidth
            />
            <Button
              element="button"
              type="button"
              className="btn btn-primary-blue btn--small-2"
              onClick={() => onClickAddNewValue("tcs")}
            >
              เพิ่ม
            </Button>
          </div>

          {toolCategory && (
            <div className="settingTool__input">
              <Input
                element="input"
                type="text"
                label=""
                id="editToolCategory"
                placeholder=""
                setState={setEditToolCategory}
                state={editToolCategory}
                fullWidth
              />
              <Button
                element="button"
                type="button"
                className="btn btn-primary-blue btn--small-2"
                onClick={() => onClickEditValue("tcs")}
              >
                แก้ไข
              </Button>
              <Button
                element="button"
                type="button"
                className="btn btn-primary-blue--outline btn--small-2"
                onClick={onClickCloseEditCategoryInput}
              >
                ยกเลิก
              </Button>
            </div>
          )}

          <div className="settingTool__category-box">
            <p className="u-mg-b--sm">รายการประเภทอุปกรณ์</p>
            <ul className="settingTool__category-list">
              {categories.length > 0 &&
                categories.map((item) => (
                  <li className="settingTool__category-item" key={item.value}>
                    <p className="settingTool__category-name">{item.name}</p>
                    <div className="settingTool__icons">
                      {!toolCategory && (
                        <FiEdit2
                          className="settingTool__icon"
                          onClick={() =>
                            onClickOpenEditCategoryInput(item.value, item.name)
                          }
                        />
                      )}
                      <FiTrash2
                        className="settingTool__icon"
                        onClick={() => onClickDeleteValue("tcs", item.value)}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingTool;
