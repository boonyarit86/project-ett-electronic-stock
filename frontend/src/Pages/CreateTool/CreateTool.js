import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Axios from "axios";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Input from "../../Components/Input/Input";
import Select from "../../Components/Select/Select";
import SelectWithValidator from "../../Components/Select/SelectWithValidator";
import Toast from "../../Components/Toast/Toast";
import UploadOneImage from "../../Components/Button/UploadOneImage";
import { AuthContext } from "../../context/auth-context";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import { useForm } from "../../hooks/form-hook";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { setTts } from "../../Redux/features/ttsSlice";
import { setTcs } from "../../Redux/features/tcsSlice";
import { catchError, catchRequestError } from "../../utils/handleError";
import "./CreateTool.css";

const CreateTool = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ttsInSelect } = useSelector((state) => state.tts);
  const { tcs } = useSelector((state) => state.tcs);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [controller, setController] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [toolCode, setToolCode] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");

  const [formState, inputHandler] = useForm(
    {
      toolName: {
        value: "",
        isValid: false,
      },
      type: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    if (!controller) {
      const ctrl = new AbortController();
      setController(ctrl);
      async function fetchDataTts() {
        dispatch(startLoading());
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tts`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(setTts(res.data.data.tts));
            dispatch(endLoading());
            setIsLoading((prev) => false);
          })
          .catch((error) => {
            setIsLoading((prev) => false);
            dispatch(endLoading());
            catchRequestError(error, setRequestError);
          });
      }
      async function fetchDataTcs() {
        dispatch(startLoading());
        await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tcs`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: ctrl.signal,
        })
          .then((res) => {
            dispatch(setTcs(res.data.data.tcs));
            setIsLoading((prev) => false);
            dispatch(endLoading());
          })
          .catch((error) => {
            setIsLoading((prev) => false);
            dispatch(endLoading());
            catchRequestError(error, setRequestError);
          });
      }
      fetchDataTts();
      fetchDataTcs();
    }

    return () => controller && controller.abort();
  }, [controller, dispatch, auth.token]);

  useEffect(() => {
    let newArr = [];
    setCategory("");
    const ttsId = formState.inputs.type.value;
    if (tcs.length > 0 && ttsId !== "") {
      tcs.forEach((item) => {
        if (item.tts === ttsId) {
          newArr.push({ name: item.name, value: item._id });
        }
      });
      setCategories(newArr);
    }
  }, [formState.inputs.type.value, tcs]);

  if (isLoading) return <div />;
  if (!isLoading && requestError) {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    const { type, toolName } = formState.inputs;

    try {
      dispatch(startLoading());
      let formData = new FormData();
      formData.append("toolName", toolName.value);
      formData.append("toolCode", toolCode);
      formData.append("type", type.value);
      formData.append("size", size);
      formData.append("avatar", file);
      formData.append("description", description);

      if (category !== "") {
        formData.append("category", category);
      }

      await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/tools`, formData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      }).then((res) => {
        dispatch(endLoading());
        navigate("/toolList");
      });
    } catch (error) {
      let mainElement = document.querySelector(".main");
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      mainElement.scrollTo(0, 0);
    }
  };

  return (
    <div className="createTool">
      <Heading type="main" text="สร้างอุปกรณ์ใหม่" className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          style={{ marginBottom: "1rem" }}
          className="u-mg-b"
        />
      )}
      <form className="createTool__form" onSubmit={onSubmit}>
        <InputWithValidator
          element="input"
          type="text"
          label="ชื่ออุปกรณ์"
          id="toolName"
          placeholder="กรอกชื่ออุปกรณ์"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorMessage="กรุณากรอกชื่ออุปกรณ์"
          required
          fullWidth
        />
        <div className="input__group">
          <Input
            element="input"
            type="text"
            label="รหัสอุปกรณ์"
            id="toolCode"
            placeholder="กรอกรหัสอุปกรณ์"
            setState={setToolCode}
            state={toolCode}
            fullWidth
          />
          <Input
            element="input"
            type="text"
            label="ขนาด"
            id="size"
            placeholder="กรอกขนาดอุปกรณ์"
            setState={setSize}
            state={size}
            fullWidth
          />
        </div>
        <div className="input__group">
          <SelectWithValidator
            label="ชนิด"
            id="type"
            placeholder="เลือกชนิดอุปกรณ์"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
            errorMessage="กรุณาเลือกชนิดอุปกรณ์"
            required
            fullWidth
            data={ttsInSelect.length > 0 ? ttsInSelect : []}
          />
          <Select
            label="ประเภท"
            id="categories"
            placeholder="เลือกประเภทอุปกรณ์"
            setState={setCategory}
            state={category}
            fullWidth
            data={categories.length > 0 ? categories : []}
          />
        </div>
        <UploadOneImage setFile={setFile} initialValue={null} />
        <Input
          element="textarea"
          label="รายละเอียดเพิ่มเติม"
          id="description"
          placeholder="ข้อมูลอื่นๆที่เกี่ยวกับอุปกรณ์"
          setState={setDescription}
          state={description}
          fullWidth
        />
        <div className="btn__group">
          <Button
            type="submit"
            element="button"
            className="btn-primary-blue"
            disabled={!formState.isValid}
          >
            บันทึก
          </Button>
          <Button
            type="button"
            element="link"
            className="btn-primary-blue--outline"
            path="/"
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTool;
