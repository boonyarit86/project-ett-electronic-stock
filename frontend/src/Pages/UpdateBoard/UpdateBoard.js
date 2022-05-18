import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Axios from "axios";
import Button from "../../Components/Button/Button";
import Heading from "../../Components/Text/Heading";
import InputWithValidator from "../../Components/Input/InputWithValidator";
import Input from "../../Components/Input/Input";
import SelectTool from "../../Components/UIelements/SelectTool";
import Toast from "../../Components/Toast/Toast";
import UploadOneImage from "../../Components/Button/UploadOneImage";
import UploadManyImage from "../../Components/Button/UploadManyImage";
import { AuthContext } from "../../context/auth-context";
import { VALIDATOR_REQUIRE } from "../../utils/validators";
import { useForm } from "../../hooks/form-hook";
import { startLoading, endLoading } from "../../Redux/features/stateSlice";
import { setTts } from "../../Redux/features/ttsSlice";
import { setTcs } from "../../Redux/features/tcsSlice";
import { catchError, catchRequestError } from "../../utils/handleError";
import { getBoard, resetBoard } from "../../Redux/features/boardSlice";
import "./UpdateBoard.css";

const UpdateBoard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ttsInSelect } = useSelector((state) => state.tts);
  const { tcs } = useSelector((state) => state.tcs);
  const { tools } = useSelector((state) => state.tool);
  const boardId = useParams().boardId;
  const board = useSelector((state) => state.board.board);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [controller, setController] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [boardCode, setBoardCode] = useState("");
  const [boardType, setBoardType] = useState("");
  const [toolType, setToolType] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState(0);
  const [fileDeleted, setFileDeleted] = useState(null);
  const [filesDeleted, setFilesDeleted] = useState([]);
  // selecTool Component
  const [toolSelected, setToolSelected] = useState("");
  const [toolTotal, setToolTotal] = useState("");
  const [toolList, setToolList] = useState([]);
  const [toolSelectedList, setToolSelectedList] = useState([]);

  const [formState, inputHandler] = useForm(
    {
      boardName: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  // Set initial tools of this board
  useEffect(() => {
    if (board?.tools?.length > 0) {
      let toolArr = [];
      board.tools.forEach((item) => {
        toolArr.push({
          tid: item?.detail?._id,
          total: item.total || 0,
          toolName: item?.detail?.toolName,
        });
      });
      setToolSelectedList(toolArr);
    }
  }, [board?.tools]);

  useEffect(() => {
    dispatch(getBoard(boardId));

    return () => {
      dispatch(resetBoard());
    };
  }, [dispatch, boardId]);

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
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
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
            setIsLoading(false);
            dispatch(endLoading());
          })
          .catch((error) => {
            setIsLoading(false);
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
    const ttsId = toolType;
    if (tcs.length > 0 && ttsId !== "") {
      tcs.forEach((item) => {
        if (item.tts === ttsId) {
          newArr.push({ name: item.name, value: item._id });
        }
      });
      setCategories(newArr);
    }
  }, [toolType, tcs]);

  useEffect(() => {
    let toolFilter = [];
    if (toolType !== "") {
      tools.forEach((item) => {
        if (item.type?._id === toolType) {
          toolFilter.push({
            name: item.toolName,
            value: item._id,
            tcsId: item.category._id,
          });
        }
      });
    }
    if (category !== "") {
      toolFilter = toolFilter.filter((item) => item.tcsId === category);
    }
    setToolSelected("");
    setToolList(toolFilter);
  }, [category, toolType, tools]);

  if (isLoading) return <div />;
  if (!isLoading && requestError) {
    return (
      <div className="updateBoard">
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
    let avatar = Boolean(fileDeleted) ? JSON.stringify(fileDeleted) : null;
    let images = Boolean(filesDeleted.length > 0)
      ? JSON.stringify(filesDeleted)
      : null;
    const { boardName } = formState.inputs;

    try {
      dispatch(startLoading());
      let formData = new FormData();
      formData.append("boardName", boardName.value);
      formData.append("boardCode", boardCode);
      formData.append("type", boardType);
      formData.append("limit", limit);
      formData.append("description", description);
      formData.append("tools", JSON.stringify(toolSelectedList));
      formData.append("avatar", avatar);
      formData.append("newAvatar", file);
      formData.append("imagesDeleted", images);

      if (files.length !== 0) {
        for (var i = 0; i < files.length; i++) {
          formData.append("newImages", files[i]);
        }
      }

      await Axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/boards/${board._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      ).then((res) => {
        dispatch(endLoading());
        navigate(`/boardList/${board._id}`);
      });
    } catch (error) {
      dispatch(endLoading());
      catchError(error, setErrorMessage);
      let mainElement = document.querySelector(".main");
      mainElement.scrollTo(0, 0);
    }
  };

  return (
    <div className="updateBoard">
      <Heading type="main" text={`แก้ไขบอร์ด ${board?.boardName}`} className="u-mg-b" />
      {errorMessage && (
        <Toast
          element="error"
          type="default"
          message={errorMessage}
          className="u-mg-b"
        />
      )}
      <div className="updateBoard__form">
        <InputWithValidator
          element="input"
          type="text"
          label="ชื่อบอร์ด"
          id="boardName"
          placeholder="กรอกชื่อบอร์ด"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
          initialValue={board.boardName}
          initialValid={true}
          errorMessage="กรุณากรอกชื่อบอร์ด"
          required
          fullWidth
        />
        <div className="input__group">
          <Input
            element="input"
            type="text"
            label="รหัสบอร์ด"
            id="boardCode"
            placeholder="กรอกรหัสบอร์ด"
            setState={setBoardCode}
            state={boardCode}
            initialValue={board.boardCode}
            fullWidth
          />
          <Input
            element="input"
            type="text"
            label="ชนิดบอร์ด"
            id="size"
            placeholder="กรอกชนิดบอร์ด"
            setState={setBoardType}
            state={boardType}
            initialValue={board.type}
            fullWidth
          />
        </div>
        <SelectTool
          toolSelected={toolSelected}
          setToolSelected={setToolSelected}
          toolTotal={toolTotal}
          setToolTotal={setToolTotal}
          toolType={toolType}
          setToolType={setToolType}
          category={category}
          setCategory={setCategory}
          categories={categories}
          ttsInSelect={ttsInSelect}
          toolList={toolList}
          toolSelectedList={toolSelectedList}
          setToolSelectedList={setToolSelectedList}
          initialData={tools}
        />
        <Input
          element="input"
          type="number"
          label="ตัวเลขการแจ้งเตือน"
          id="limit"
          setState={setLimit}
          state={limit}
          initialValue={board.limit}
          helperText="เมื่อค่าตัวเลขมีน้อยกว่าที่กำหนดไว้ระบบจะทำการแจ้งเตือนสถานะ “กำลังหมด” สำหรับค่าพื้นฐานคือการไม่กำหนดค่าหรือกำหนดค่าเป็น 0"
          fullWidth
        />
        <UploadOneImage
          setFile={setFile}
          initialValue={board?.avatar}
          setFileDeleted={setFileDeleted}
        />
        <UploadManyImage
          setFiles={setFiles}
          initialValue={board?.images}
          setFilesDeleted={setFilesDeleted}
          files={files}
        />
        <Input
          element="textarea"
          label="รายละเอียดเพิ่มเติม"
          id="description"
          placeholder="ข้อมูลอื่นๆที่เกี่ยวกับบอร์ด"
          setState={setDescription}
          state={description}
          initialValue={board.description}
          fullWidth
        />
        <div className="btn__group">
          <Button
            type="button"
            element="button"
            className="btn-primary-blue"
            disabled={!formState.isValid}
            onClick={onSubmit}
          >
            บันทึก
          </Button>
          <Button
            type="button"
            element="link"
            className="btn-primary-blue--outline"
            path={`/boardList/${board._id}`}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBoard;
