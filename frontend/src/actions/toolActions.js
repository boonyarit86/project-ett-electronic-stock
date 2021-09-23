import {
  ACTION_TOOL_FAIL,
  ACTION_TOOL_REQUEST,
  ACTION_TOOL_SUCCESS,
  CREATE_TOOL_FAIL,
  CREATE_TOOL_REQUEST,
  CREATE_TOOL_SUCCESS,
  DELETE_TOOL_FAIL,
  DELETE_TOOL_REQUEST,
  DELETE_TOOL_SUCCESS,
  EDIT_TOOL_FAIL,
  EDIT_TOOL_REQUEST,
  EDIT_TOOL_SUCCESS,
  GET_ALL_TOOL_FAIL,
  GET_ALL_TOOL_REQUEST,
  GET_ALL_TOOL_SUCCESS,
  GET_TOOL_FAIL,
  GET_TOOL_REQUEST,
  GET_TOOL_SUCCESS,
  HISTORY_TOOL_LIST_FAIL,
  HISTORY_TOOL_LIST_REQUEST,
  HISTORY_TOOL_LIST_SUCCESS,
  RESTORE_HISTORY_TOOL_FAIL,
  RESTORE_HISTORY_TOOL_REQUEST,
  RESTORE_HISTORY_TOOL_SUCCESS,
} from "../constants/toolConstants";
import catchErrors from "../shared/utils/catchErrors";
import Axios from "axios";

// Components
import {
  notifySuccess,
  notifyError,
} from "../shared/components/UIElements/Toasts";

// const react_api_url = "http://localhost:5000/api/tools";
const AuthToken = (token) => {
  return { Authorization: `Bearer ${token}` };
};

export const getAllToolAction = (token, setTools, setDefaultValue) => async (dispatch) => {
  dispatch({ type: GET_ALL_TOOL_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tools`, {
      headers: AuthToken(token),
    }).then((res) => {
      setTools(res.data);
      setDefaultValue(res.data);
      dispatch({ type: GET_ALL_TOOL_SUCCESS });
    });
  } catch (error) {
    dispatch({
      type: GET_ALL_TOOL_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const getToolAction = (token, tid) => async (dispatch) => {
  dispatch({ type: GET_TOOL_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tools/${tid}`, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: GET_TOOL_SUCCESS, payload: res.data });
    });
  } catch (error) {
    dispatch({
      type: GET_TOOL_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const toolActions = (token, data, tid) => async (dispatch) => {
  dispatch({ type: ACTION_TOOL_REQUEST });
  try {
    await Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/tools/actions/${tid}`,
      data,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: ACTION_TOOL_SUCCESS });
      notifySuccess("ทำรายการสำเร็จ");
    });
  } catch (error) {
    dispatch({
      type: ACTION_TOOL_FAIL,
      // payload: catchErrors(error),
    });
    notifyError(catchErrors(error));
  }
};

export const createToolAction = (token, tool, history) => async (dispatch) => {
  dispatch({ type: CREATE_TOOL_REQUEST });

  try {
    let formData = new FormData();
    formData.append("toolName", tool.toolName);
    formData.append("toolCode", tool.toolCode);
    formData.append("size", tool.size);
    formData.append("type", tool.type);
    formData.append("category", tool.category);
    formData.append("description", tool.description);
    // กรณีผู้ใช้กำหนดรูปภาพมาอยู่แล้ว
    if (typeof tool.avartar === null) {
      formData.append("avartar", "");
    }
    // กรณีผู้เปลี่ยนรูปภาพใหม่
    if (typeof tool.avartar === "object") {
      formData.append("avartar", tool.avartar);
    }
    await Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/tools/create`,
      formData,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: CREATE_TOOL_SUCCESS, payload: res.data });
      history.push("/tool/list");
    });
  } catch (error) {
    dispatch({
      type: CREATE_TOOL_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editToolAction = (token, tool, history) => async (dispatch) => {
  dispatch({ type: EDIT_TOOL_REQUEST });
  try {
    let newImagesArr = [];
    let formData = new FormData();
    formData.append("toolName", tool.toolName);
    formData.append("toolCode", tool.toolCode);
    formData.append("type", tool.type);
    formData.append("category", tool.category);
    formData.append("limit", tool.limit);
    formData.append("size", tool.size);
    formData.append("description", tool.description);
    // กรณี ผู้ใช้ไม่ได้แก้ไขรูปภาพ
    // console.log(tool.imageProfile)
    // if (typeof tool.avartar === "string") {
    //   console.log("no image");
    //   formData.append("avartar", tool.avartar);
    // }
    // กรณี ผู้ใช้ลบรูปภาพและไม่ได้อัพลงไปใหม่ หรือ ไม่มีรูปภาพอยู่แล้ว
    if (tool.avartar === null) {
      console.log("no image");
      formData.append("avartar", false);
    }
    // กรณี ผู้ใช้อัพโหลดรูปภาพใหม่
    else if (tool.avartar.name) {
      // console.log("new image");
      formData.append("avartar", true);
      newImagesArr = [...newImagesArr, tool.avartar];
    }

    // กรณีผู้ไม่ได้กำหนดรูปภาพรายละเอียดอุปกรณ์
    let oldImages = [];
    if (tool.images.length === 0 || tool.images.length === undefined) {
      console.log("No imges")
      formData.append("images", false);
    } else {
      let newImages = false;
      for (var round = 0; round < tool.images.length; round++) {
        // เก็บรูปภาพเก่าที่ไม่ถูกลบ แยกออกไป เพื่อป้องกันการอัพโหลดรูปภาพซ้ำ
        if (tool.images[round].name === undefined) {
          console.log("default images");
          oldImages = [...oldImages, tool.images[round]];
        }
        // เก็บรูปภาพใหม่ที่อัพมา แยกออกไป เพื่อรอการอัพโหลด
        else if (tool.images[round].name !== undefined) {
          console.log("new images");
          newImages = true;
          newImagesArr = [...newImagesArr, tool.images[round]];
        }
      }
      // ถ้ามีรูปภาพใหม่ถูกอัพโหลด
      if (newImages === true) {
        formData.append("images", true);
      }
      // ถ้าไม่มีรูปภาพใหม่ถูกอัพโหลด
      else {
        console.log("no images");
        formData.append("images", false);
      }
      console.log("statusImg: ", newImages);
    }

    // กำหนดรูปใหม่ที่ต้องการอัพโหลด
    if (newImagesArr.length !== 0) {
      for (var i = 0; i < newImagesArr.length; i++) {
        formData.append("allImages", newImagesArr[i]);
      }
    }
    // เก็บรูปภาพเก่่าไว้ที่นี้
    formData.append("oldImages", JSON.stringify(oldImages));
    formData.append("delImages", JSON.stringify(tool.imagesDel));

    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/tools/edit/` + tool.id,
      formData,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: EDIT_TOOL_SUCCESS, payload: res.data });
      history.push(`/${tool.id}/tool`);
    });
  } catch (error) {
    dispatch({ type: EDIT_TOOL_FAIL, payload: catchErrors(error) });
  }
};


export const deleteToolAction = (token, tid, history) => async (dispatch) => {
  dispatch({ type: DELETE_TOOL_REQUEST });
  try {
    await Axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/tools/delete/${tid}`,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: DELETE_TOOL_SUCCESS });
      history.push("/tool/list");
    });
  } catch (error) {
    dispatch({
      type: DELETE_TOOL_FAIL,
      payload: catchErrors(error)
    });
    notifyError(catchErrors(error));
  }
};

export const getAllHistoryToolAction = (token) => async (dispatch) => {
  dispatch({ type: HISTORY_TOOL_LIST_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/tools/history`, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: HISTORY_TOOL_LIST_SUCCESS, payload: res.data });
    });
  } catch (error) {
    dispatch({
      type: HISTORY_TOOL_LIST_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const restoreToolAction = (token, data) => async (dispatch) => {
  dispatch({ type: RESTORE_HISTORY_TOOL_REQUEST });
  try {
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/tools/history/restore`,
      data,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: RESTORE_HISTORY_TOOL_SUCCESS, payload: res.data });
      notifySuccess("ทำรายการสำเร็จ");
    });
  } catch (error) {
    dispatch({
      type: RESTORE_HISTORY_TOOL_FAIL,
      payload: catchErrors(error)
    });
  }
};
