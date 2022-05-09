import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import Axios from "axios";
import { AuthContext } from "../../context/auth-context";
import Heading from "../../Components/Text/Heading";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Input from "../../Components/Input/Input";
import Toast from "../../Components/Toast/Toast";
import SelectWithValidator from "../../Components/Select/SelectWithValidator";
import UploadOneImage from "../../Components/Button/UploadOneImage";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import { useForm } from "../../hooks/form-hook";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { setTts } from "../../Redux/features/ttsSlice";
import { setTcs } from "../../Redux/features/tcsSlice";
import Button from "../../Components/Button/Button";
import { catchError, catchRequestError } from "../../utils/handleError";
import Select from "../../Components/Select/Select";

const CreateTool = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const { tts, ttsInSelect } = useSelector((state) => state.tts);
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
            // console.log(res.data.data.tts);
            dispatch(setTts(res.data.data.tts));
            dispatch(endLoading());
            setIsLoading((prev) => false);
          })
          .catch((error) => {
            // Show error on Modal and Do it later.
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
            // console.log(res.data.data.tcs);
            dispatch(setTcs(res.data.data.tcs));
            setIsLoading((prev) => false);
            dispatch(endLoading());
          })
          .catch((error) => {
            // Show error on Modal and Do it later.
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
    setCategory("")
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

//   console.log(formState.inputs.type, " : ", category)
  if (isLoading) return <div>Loading...</div>;
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

  return (
    <div className="createTool">
      <Heading type="main" text="สร้างอุปกรณ์ใหม่" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          style={{ marginBottom: "1rem" }}
        />
      )}
      <form>
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
