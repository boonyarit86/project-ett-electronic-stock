import React, { useContext, useEffect, useState } from "react";
import Axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import Input from "../../Components/Input/Input";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Select from "../../Components/Select/Select";
import SelectWithValidator from "../../Components/Select/SelectWithValidator";
import Toast from "../../Components/Toast/Toast";
import UploadOneImage from "../../Components/Button/UploadOneImage";
import UploadManyImage from "../../Components/Button/UploadManyImage";
import { useForm } from "../../hooks/form-hook";
import { AuthContext } from "../../context/auth-context";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import { catchError, catchRequestError } from "../../utils/handleError";
import { endLoading, startLoading } from "../../Redux/features/stateSlice";
import { getTool, resetTool } from "../../Redux/features/toolSlice";
import { setTts } from "../../Redux/features/ttsSlice";
import { setTcs } from "../../Redux/features/tcsSlice";
import "./UpdateTool.css";

const UpdateTool = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const toolId = useParams().toolId;
  const tool = useSelector((state) => state.tool.tool);
  const dispatch = useDispatch();
  const { ttsInSelect } = useSelector((state) => state.tts);
  const { tcs } = useSelector((state) => state.tcs);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [controller, setController] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [toolCode, setToolCode] = useState("");
  const [size, setSize] = useState("");
  const [limit, setLimit] = useState(0);
  const [description, setDescription] = useState("");
  const [fileDeleted, setFileDeleted] = useState(null);
  const [filesDeleted, setFilesDeleted] = useState([]);

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
    dispatch(getTool(toolId));

    return () => {
      dispatch(resetTool());
    };
  }, [dispatch, toolId]);

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
    let avatar = Boolean(fileDeleted) ? JSON.stringify(fileDeleted) : null;
    let images = Boolean(filesDeleted.length > 0)
      ? JSON.stringify(filesDeleted)
      : null;
    e.preventDefault();
    const { type, toolName } = formState.inputs;

    try {
      dispatch(startLoading());
      let formData = new FormData();
      formData.append("toolName", toolName.value);
      formData.append("toolCode", toolCode);
      formData.append("type", type.value);
      formData.append("size", size);
      formData.append("limit", limit);
      formData.append("newAvatar", file);
      formData.append("avatar", avatar);
      formData.append("newImages", files);
      formData.append("imagesDeleted", images);
      formData.append("description", description);

      if (files.length !== 0) {
        for (var i = 0; i < files.length; i++) {
          formData.append("newImages", files[i]);
        }
      }

      if (category !== "") {
        formData.append("category", category);
      }

      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/tools/${tool._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        navigate(`/toolList/${tool._id}`);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      let mainElement = document.querySelector(".main");
      mainElement.scrollTo(0, 0);
    }
  };

  return (
    <div className="updateTool">
      <Heading
        type="main"
        text={`แก้ไขอุปกรณ์ ${tool.toolName}`}
        className="u-mg-b"
      />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      <form className="updateTool__form" onSubmit={onSubmit}>
        <InputWithValidator
          element="input"
          type="text"
          label="ชื่ออุปกรณ์"
          id="toolName"
          placeholder="กรอกชื่ออุปกรณ์"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          errorMessage="กรุณากรอกชื่ออุปกรณ์"
          initialValue={tool.toolName}
          initialValid={true}
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
            initialValue={tool.toolCode}
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
            initialValue={tool.size}
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
            initialValue={tool.type._id}
            initialValid={true}
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
            initialValue={tool.category._id}
          />
        </div>
        <Input
          element="input"
          type="number"
          label="ตัวเลขการแจ้งเตือน"
          id="limit"
          setState={setLimit}
          state={limit}
          initialValue={tool.limit}
          helperText="เมื่อค่าตัวเลขมีน้อยกว่าที่กำหนดไว้ระบบจะทำการแจ้งเตือนสถานะ “กำลังหมด” สำหรับค่าพื้นฐานคือการไม่กำหนดค่าหรือกำหนดค่าเป็น 0"
          fullWidth
        />
        <UploadOneImage
          setFile={setFile}
          initialValue={tool?.avatar}
          setFileDeleted={setFileDeleted}
        />
        <UploadManyImage
          setFiles={setFiles}
          initialValue={tool?.images}
          setFilesDeleted={setFilesDeleted}
          files={files}
        />
        <Input
          element="textarea"
          label="รายละเอียดเพิ่มเติม"
          id="description"
          placeholder="ข้อมูลอื่นๆที่เกี่ยวกับอุปกรณ์"
          setState={setDescription}
          state={description}
          initialValue={tool.description}
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
            path={`/toolList/${tool._id}`}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTool;
