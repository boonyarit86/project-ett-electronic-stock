import {
  ACTION_BOARD_FAIL,
  ACTION_BOARD_REQUEST,
  ACTION_BOARD_SUCCESS,
  CHECK_BOARD_FAIL,
  CHECK_BOARD_REQUEST,
  CHECK_BOARD_SUCCESS,
  CREATE_BOARD_FAIL,
  CREATE_BOARD_REQUEST,
  CREATE_BOARD_SUCCESS,
  DELETE_BOARD_FAIL,
  DELETE_BOARD_REQUEST,
  DELETE_BOARD_SUCCESS,
  EDIT_BOARD_FAIL,
  EDIT_BOARD_REQUEST,
  EDIT_BOARD_SUCCESS,
  EDIT_INCOMPLETE_TOOL_FAIL,
  EDIT_INCOMPLETE_TOOL_REQUEST,
  EDIT_INCOMPLETE_TOOL_SUCCESS,
  GET_ALL_BOARD_FAIL,
  GET_ALL_BOARD_REQUEST,
  GET_ALL_BOARD_SUCCESS,
  GET_BOARD_FAIL,
  GET_BOARD_REQUEST,
  GET_BOARD_SUCCESS,
  HISTORY_BOARD_LIST_FAIL,
  HISTORY_BOARD_LIST_REQUEST,
  HISTORY_BOARD_LIST_SUCCESS,
  INCOMPLETE_TOOL_FAIL,
  INCOMPLETE_TOOL_REQUEST,
  INCOMPLETE_TOOL_SUCCESS,
  RESTORE_HISTORY_BOARD_FAIL,
  RESTORE_HISTORY_BOARD_REQUEST,
  RESTORE_HISTORY_BOARD_SUCCESS,
} from "../constants/boardConstants";
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

export const getAllBoardAction =
  (token, setBoards, setDefaultValue) => async (dispatch) => {
    dispatch({ type: GET_ALL_BOARD_REQUEST });
    try {
      await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards`, {
        headers: AuthToken(token),
      }).then((res) => {
        setBoards(res.data);
        setDefaultValue && setDefaultValue(res.data);
        dispatch({ type: GET_ALL_BOARD_SUCCESS });
      });
    } catch (error) {
      dispatch({
        type: GET_ALL_BOARD_FAIL,
        payload: catchErrors(error),
      });
    }
  };

export const createBoardAction =
  (token, board, history) => async (dispatch) => {
    dispatch({ type: CREATE_BOARD_REQUEST });

    try {
      let formData = new FormData();
      formData.append("boardName", board.boardName);
      formData.append("boardCode", board.boardCode);
      formData.append("type", board.type);
      formData.append("tools", JSON.stringify(board.tools));
      formData.append("description", board.description);
      // กรณีผู้ใช้กำหนดรูปภาพมาอยู่แล้ว
      if (typeof board.avartar === null) {
        formData.append("avartar", "");
      }
      // กรณีผู้เปลี่ยนรูปภาพใหม่
      if (typeof board.avartar === "object") {
        formData.append("avartar", board.avartar);
      }
      await Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/boards/create`,
        formData,
        {
          headers: AuthToken(token),
        }
      ).then((res) => {
        dispatch({ type: CREATE_BOARD_SUCCESS, payload: res.data });
        history.push("/board/list");
        // history.push("/");
      });
    } catch (error) {
      dispatch({
        type: CREATE_BOARD_FAIL,
        payload: catchErrors(error),
      });
    }
  };

export const getBoardAction = (token, bid) => async (dispatch) => {
  dispatch({ type: GET_BOARD_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards/${bid}`, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: GET_BOARD_SUCCESS, payload: res.data });
    });
  } catch (error) {
    dispatch({
      type: GET_BOARD_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const checkBoardAction = (token, data, bid) => async (dispatch) => {
  dispatch({ type: CHECK_BOARD_REQUEST });
  try {
    await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/boards/check/${bid}`, data, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: CHECK_BOARD_SUCCESS, payload: res.data });
      console.log(res.data)
    });
  } catch (error) {
    dispatch({
      type: CHECK_BOARD_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const boardActions = (token, data, bid) => async (dispatch) => {
  dispatch({ type: ACTION_BOARD_REQUEST });
  try {
    await Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/boards/actions/${bid}`,
      data,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: ACTION_BOARD_SUCCESS });
      notifySuccess("ทำรายการสำเร็จ");
    });
  } catch (error) {
    dispatch({
      type: ACTION_BOARD_FAIL,
      // payload: catchErrors(error),
    });
    notifyError(catchErrors(error));
  }
};

export const requestBoardAction = (token, data, history) => async (dispatch) => {
  dispatch({ type: ACTION_BOARD_REQUEST });
  try {
    await Axios.post(`${process.env.REACT_APP_BACKEND_URL}/boards/request`, data, {
      headers: AuthToken(token),
    }).then((res) => {
      // console.log(res.data)
      dispatch({ type: ACTION_BOARD_SUCCESS });
      history.push("/board/list");
    });
  } catch (error) {
    dispatch({
      type: ACTION_BOARD_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const editBoardAction = (token, board, history) => async (dispatch) => {
  dispatch({ type: EDIT_BOARD_REQUEST });
  try {
    let newImagesArr = [];
    let formData = new FormData();
    formData.append("boardName", board.boardName);
    formData.append("boardCode", board.boardCode);
    formData.append("type", board.type);
    formData.append("tools", JSON.stringify(board.tools));
    formData.append("limit", board.limit);
    formData.append("description", board.description);
    // กรณี ผู้ใช้ไม่ได้แก้ไขรูปภาพ
    // console.log(board.imageProfile)
    // if (typeof board.avartar === "string") {
    //   console.log("no image");
    //   formData.append("avartar", board.avartar);
    // }
    // กรณี ผู้ใช้ลบรูปภาพและไม่ได้อัพลงไปใหม่ หรือ ไม่มีรูปภาพอยู่แล้ว
    if (board.avartar === null) {
      console.log("no image");
      formData.append("avartar", false);
    }
    // กรณี ผู้ใช้อัพโหลดรูปภาพใหม่
    else if (board.avartar.name) {
      // console.log("new image");
      formData.append("avartar", true);
      newImagesArr = [...newImagesArr, board.avartar];
    }

    // กรณีผู้ไม่ได้กำหนดรูปภาพรายละเอียดอุปกรณ์
    let oldImages = [];
    if (board.images.length === 0 || board.images.length === undefined) {
      console.log("No imges")
      formData.append("images", false);
    } else {
      let newImages = false;
      for (var round = 0; round < board.images.length; round++) {
        // เก็บรูปภาพเก่าที่ไม่ถูกลบ แยกออกไป เพื่อป้องกันการอัพโหลดรูปภาพซ้ำ
        if (board.images[round].name === undefined) {
          console.log("default images");
          oldImages = [...oldImages, board.images[round]];
        }
        // เก็บรูปภาพใหม่ที่อัพมา แยกออกไป เพื่อรอการอัพโหลด
        else if (board.images[round].name !== undefined) {
          console.log("new images");
          newImages = true;
          newImagesArr = [...newImagesArr, board.images[round]];
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
    formData.append("delImages", JSON.stringify(board.imagesDel));

    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/boards/edit/` + board.id,
      formData,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: EDIT_BOARD_SUCCESS, payload: res.data });
      history.push(`/${board.id}/board`);
    });
  } catch (error) {
    dispatch({ type: EDIT_BOARD_FAIL, payload: catchErrors(error) });
  }
};

export const getAllHistoryBoardAction = (token) => async (dispatch) => {
  dispatch({ type: HISTORY_BOARD_LIST_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards/history`, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: HISTORY_BOARD_LIST_SUCCESS, payload: res.data });
    });
  } catch (error) {
    dispatch({
      type: HISTORY_BOARD_LIST_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const restoreBoardAction = (token, data, path) => async (dispatch) => {
  dispatch({ type: RESTORE_HISTORY_BOARD_REQUEST });
  try {
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/boards/history/${path}`,
      data,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: RESTORE_HISTORY_BOARD_SUCCESS, payload: res.data });
      notifySuccess("ทำรายการสำเร็จ");
    });
  } catch (error) {
    dispatch({
      type: RESTORE_HISTORY_BOARD_FAIL,
      payload: catchErrors(error)
    });
  }
};

export const deleteBoardAction = (token, bid, history) => async (dispatch) => {
  dispatch({ type: DELETE_BOARD_REQUEST });
  try {
    await Axios.delete(
      `${process.env.REACT_APP_BACKEND_URL}/boards/delete/${bid}`,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      dispatch({ type: DELETE_BOARD_SUCCESS });
      history.push("/board/list");
    });
  } catch (error) {
    dispatch({
      type: DELETE_BOARD_FAIL,
      payload: catchErrors(error)
    });
    notifyError(catchErrors(error));
  }
};

export const getIncompleteToolAction = (token) => async (dispatch) => {
  dispatch({ type: INCOMPLETE_TOOL_REQUEST });
  try {
    await Axios.get(`${process.env.REACT_APP_BACKEND_URL}/boards/incompletetool`, {
      headers: AuthToken(token),
    }).then((res) => {
      dispatch({ type: INCOMPLETE_TOOL_SUCCESS, payload: res.data });
      console.log(res.data)
    });
  } catch (error) {
    dispatch({
      type: INCOMPLETE_TOOL_FAIL,
      payload: catchErrors(error),
    });
  }
};

export const requestIncompleteToolActions = (token, data) => async (dispatch) => {
  // console.log(data)
  dispatch({ type: EDIT_INCOMPLETE_TOOL_REQUEST });
  try {
    await Axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/boards/update/incompletetool/${data._id}`,
      data,
      {
        headers: AuthToken(token),
      }
    ).then((res) => {
      console.log(res.data)
      dispatch({ type: EDIT_INCOMPLETE_TOOL_SUCCESS, payload: res.data });
      // notifySuccess("ทำรายการสำเร็จ");
    });
  } catch (error) {
    // console.log(catchErrors(error))
    dispatch({
      type: EDIT_INCOMPLETE_TOOL_FAIL,
      payload: catchErrors(error)
    });
    // notifyError(catchErrors(error));
  }
};